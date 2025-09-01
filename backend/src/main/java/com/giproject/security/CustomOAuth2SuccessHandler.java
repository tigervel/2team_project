// src/main/java/com/giproject/security/CustomOAuth2SuccessHandler.java
package com.giproject.security;

import static com.giproject.security.jwt.JwtClaimKeys.EMAIL;
import static com.giproject.security.jwt.JwtClaimKeys.PROVIDER;
import static com.giproject.security.jwt.JwtClaimKeys.PROVIDER_ID;
import static com.giproject.security.jwt.JwtClaimKeys.UID;
import static com.giproject.security.jwt.JwtClaimKeys.ROLES;

import com.giproject.entity.member.Member;
import com.giproject.entity.account.UserIndex;
import com.giproject.repository.member.MemberRepository;
import com.giproject.repository.account.UserIndexRepo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

/**
 * 소셜 로그인 성공 시 분기:
 *  - 기존 회원(email로 매칭) => access/refresh 즉시 발급 후 콜백으로 리다이렉트
 *  - 미가입 => 프리필용 임시 토큰(signup_ticket) 발급 후 /signup 으로 리다이렉트
 *
 * ✅ JwtClaimKeys 상수를 사용해 토큰 클레임 키를 전 구간에서 일치시킵니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;              // 액세스/리프레시 & 프리필(임시) 토큰 생성
    private final MemberRepository memberRepository;  // 가입 여부/회원 조회
    private final UserIndexRepo userIndexRepo;        // user_index 도메인 권한 조회

    @Value("${frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        String provider   = token.getAuthorizedClientRegistrationId(); // "google" | "kakao" | "naver"
        String providerUp = provider == null ? null : provider.toUpperCase();

        OAuth2User oAuth2User = token.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email      = extractEmail(provider, attributes);
        String name       = extractName(provider, attributes);
        String providerId = extractProviderId(provider, attributes);

        log.info("OAuth2 success provider={}, email={}, name={}, providerId={}", provider, email, name, providerId);

        // 1) 이메일 동의 누락 → 가입 페이지로 (프리필 불가)
        if (email == null || email.isBlank()) {
            String redirect = frontendBaseUrl + "/signup?social=" + provider + "&reason=no_email";
            getRedirectStrategy().sendRedirect(request, response, redirect);
            return;
        }

        // 2) 기존 회원: 액세스/리프레시 발급 → 콜백 페이지로 전달(#hash)
        Optional<Member> maybeMember = memberRepository.findByMemEmail(email);
        if (maybeMember.isPresent()) {
            Member m = maybeMember.get();
            String subject = m.getMemId(); // JWT subject: 내부 로그인키(memId)

            // (1) 엔티티 보유 권한 수집 (전역권한)
            List<String> base = toRoleNames(m);          // 예: ["USER"] 또는 ["ADMIN"]
            List<String> roles = prefixRoles(base);      // 예: ["ROLE_USER"] 또는 ["ROLE_ADMIN"]

            // (2) user_index의 도메인 권한(SHIPPER/DRIVER/ADMIN) 추가
            userIndexRepo.findByLoginId(subject).ifPresent(ui -> {
                UserIndex.Role domain = ui.getRole();
                if (domain != null) {
                    roles.add("ROLE_" + domain.name());  // ROLE_SHIPPER / ROLE_DRIVER / ROLE_ADMIN
                }
            });

            // (3) 전역 권한 보정: ADMIN 없으면 최소 ROLE_USER 보장
            if (roles.stream().noneMatch("ROLE_ADMIN"::equals)) {
                roles.add("ROLE_USER");
            }

            // (4) 중복 제거(순서 유지)
            List<String> authorities = new ArrayList<>(new LinkedHashSet<>(roles));

            Map<String, Object> claims = new HashMap<>();
            claims.put(EMAIL, email);               // ✅ 상수 사용
            claims.put(UID, subject);               // ✅ 상수 사용
            claims.put(ROLES, authorities);         // ✅ 상수 사용
            if (providerUp != null)  claims.put(PROVIDER,   providerUp);   // ✅ 상수 사용
            if (providerId != null)  claims.put(PROVIDER_ID, providerId);  // ✅ 상수 사용

            String access  = jwtService.createAccessToken(claims, subject);
            String refresh = jwtService.createRefreshToken(Map.of(UID, subject), subject);

            String hash = "#access="  + URLEncoder.encode(access,  StandardCharsets.UTF_8)
                        + "&refresh=" + URLEncoder.encode(refresh, StandardCharsets.UTF_8);

            getRedirectStrategy().sendRedirect(request, response, frontendBaseUrl + "/auth/callback" + hash);
            return;
        }

        // 3) 첫 소셜 로그인(미가입): 프리필용 임시 토큰(5분) → 가입 페이지로 전달(#hash)
        Map<String, Object> prefillClaims = new HashMap<>();
        prefillClaims.put(EMAIL,    email);       // ✅ 상수 사용
        prefillClaims.put(PROVIDER, providerUp);  // ✅ 상수 사용
        if (name != null)       prefillClaims.put("name", name); // 이름은 별도 키 유지
        if (providerId != null) prefillClaims.put(PROVIDER_ID, providerId); // ✅ 상수 사용

        // 임시 토큰 subject: providerId 우선, 없으면 email 사용
        String tempSubject = (providerUp != null && providerId != null)
                ? (providerUp + ":" + providerId)
                : ("SOCIAL_PREFILL:" + email);

        long ttlMillis = Duration.ofMinutes(5).toMillis(); // JwtService 인자가 밀리초라고 가정
        String signupTicket = jwtService.createTempToken(tempSubject, prefillClaims, ttlMillis);

        String hash = "#signup_ticket=" + URLEncoder.encode(signupTicket, StandardCharsets.UTF_8)
                    + "&social=" + provider;

        getRedirectStrategy().sendRedirect(request, response, frontendBaseUrl + "/signup" + hash);
    }

    // ====== Provider별 이메일/이름/ID 추출 유틸 ======
    @SuppressWarnings("unchecked")
    private String extractEmail(String provider, Map<String, Object> attributes) {
        if ("google".equals(provider)) {
            return (String) attributes.get("email");
        } else if ("kakao".equals(provider)) {
            Map<String, Object> acc = (Map<String, Object>) attributes.get("kakao_account");
            return acc == null ? null : (String) acc.get("email");
        } else if ("naver".equals(provider)) {
            Map<String, Object> resp = (Map<String, Object>) attributes.get("response");
            return resp == null ? null : (String) resp.get("email");
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private String extractName(String provider, Map<String, Object> attributes) {
        if ("google".equals(provider)) {
            Object v = attributes.getOrDefault("name", attributes.get("given_name"));
            return v == null ? null : v.toString();
        } else if ("kakao".equals(provider)) {
            Map<String, Object> acc = (Map<String, Object>) attributes.get("kakao_account");
            Map<String, Object> profile = acc == null ? null : (Map<String, Object>) acc.get("profile");
            Object nick = profile == null ? null : profile.get("nickname");
            return nick == null ? null : nick.toString();
        } else if ("naver".equals(provider)) {
            Map<String, Object> resp = (Map<String, Object>) attributes.get("response");
            Object nm = resp == null ? null : resp.get("name");
            return nm == null ? null : nm.toString();
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private String extractProviderId(String provider, Map<String, Object> attributes) {
        if ("google".equals(provider)) {
            Object sub = attributes.get("sub"); // OIDC subject
            return sub == null ? null : sub.toString();
        } else if ("kakao".equals(provider)) {
            Object id = attributes.get("id"); // Long
            return id == null ? null : String.valueOf(id);
        } else if ("naver".equals(provider)) {
            Map<String, Object> resp = (Map<String, Object>) attributes.get("response");
            Object id = resp == null ? null : resp.get("id");
            return id == null ? null : id.toString();
        }
        return null;
    }

    /** Member → role 이름 리스트(프로젝트 스키마에 맞게 유연 처리) */
    private List<String> toRoleNames(Member m) {
        try {
            List<?> raw = m.getMemberRoleList(); // List<String> or List<RoleEntity> 가정
            if (raw == null || raw.isEmpty()) return new ArrayList<>();

            if (raw.get(0) instanceof String) {
                @SuppressWarnings("unchecked")
                List<String> asStr = (List<String>) raw;
                return new ArrayList<>(asStr);
            }

            // 엔티티 타입일 경우 toString() 또는 getRoleName()
            List<String> names = new ArrayList<>();
            for (Object r : raw) {
                try {
                    var method = r.getClass().getMethod("getRoleName");
                    Object v = method.invoke(r);
                    names.add(String.valueOf(v));
                } catch (NoSuchMethodException e) {
                    names.add(String.valueOf(r));
                }
            }
            return names;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /** "USER" → "ROLE_USER" 형태로 정규화 */
    private List<String> prefixRoles(List<String> names) {
        if (names == null) return new ArrayList<>();
        List<String> out = new ArrayList<>(names.size());
        for (String n : names) {
            if (n == null || n.isBlank()) continue;
            out.add(n.startsWith("ROLE_") ? n : ("ROLE_" + n));
        }
        return out;
    }
}
