// src/main/java/com/giproject/security/CustomOAuth2SuccessHandler.java
package com.giproject.security;

import static com.giproject.security.jwt.JwtClaimKeys.EMAIL;
import static com.giproject.security.jwt.JwtClaimKeys.PROVIDER;
import static com.giproject.security.jwt.JwtClaimKeys.PROVIDER_ID;
import static com.giproject.security.jwt.JwtClaimKeys.ROLES;
import static com.giproject.security.jwt.JwtClaimKeys.UID;

import com.giproject.entity.account.UserIndex;
import com.giproject.entity.member.Member;
import com.giproject.repository.account.UserIndexRepo;
import com.giproject.repository.member.MemberRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * 소셜 로그인 성공 시 분기:
 *  - 기존 회원(email 매칭)  : Access/Refresh 즉시 발급 → /auth/callback 으로 해시 전달
 *  - 미가입(첫 소셜 로그인): 5분 TTL 임시 토큰(signup_ticket) 발급 → /signup#signup_ticket=... 으로 리다이렉트
 *
 * JwtService.createTempToken(...)는 "초 단위" TTL을 받으므로 주의!
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;               // Access/Refresh/Temp 토큰 발급
    private final MemberRepository memberRepository;   // 이메일로 기존회원 조회
    private final UserIndexRepo userIndexRepo;         // 도메인 권한(SHIPPER/DRIVER/ADMIN) 조회

    @Value("${frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        String provider = token.getAuthorizedClientRegistrationId();           // google | kakao | naver
        String providerUp = provider == null ? null : provider.toUpperCase();

        OAuth2User oAuth2User = (OAuth2User) token.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = extractEmail(provider, attributes);
        String name  = extractName(provider, attributes);
        String provId = extractProviderId(provider, attributes);

        log.info("OAuth2 success provider={}, email={}, name={}, providerId={}", provider, email, name, provId);

        // 1) 이메일 동의 누락 → 가입 페이지로(프리필 불가)
        if (email == null || email.isBlank()) {
            String redirect = frontendBaseUrl + "/signup?social=" + safe(provider) + "&reason=no_email";
            getRedirectStrategy().sendRedirect(request, response, redirect);
            return;
        }

        // 2) 기존 회원: 바로 Access/Refresh 발급 → /auth/callback#access=...&refresh=...
        Optional<Member> maybeMember = memberRepository.findByMemEmail(email);
        if (maybeMember.isPresent()) {
            Member member = maybeMember.get();
            String subject = member.getMemId(); // JWT subject: 내부 로그인키(memId)

            // (1) 엔티티 권한 수집 (예: ["USER"] / ["ADMIN"])
            List<String> base = toRoleNames(member);
            List<String> roles = prefixRoles(base);

            // (2) 도메인 권한 합산 (ROLE_SHIPPER / ROLE_DRIVER / ROLE_ADMIN)
            userIndexRepo.findByLoginId(subject).ifPresent(ui -> {
                UserIndex.Role domain = ui.getRole();
                if (domain != null) {
                    roles.add("ROLE_" + domain.name());
                }
            });

            // (3) 전역 보정: ADMIN 없으면 최소 ROLE_USER 보장
            if (roles.stream().noneMatch("ROLE_ADMIN"::equals)) {
                roles.add("ROLE_USER");
            }

            // (4) 중복 제거(순서 유지)
            List<String> authorities = new ArrayList<>(new LinkedHashSet<>(roles));

            Map<String, Object> claims = new HashMap<>();
            claims.put(EMAIL, email);
            claims.put(UID, subject);
            claims.put(ROLES, authorities);
            if (providerUp != null) claims.put(PROVIDER, providerUp);
            if (provId != null)     claims.put(PROVIDER_ID, provId);

            String access  = jwtService.createAccessToken(claims, subject);
            String refresh = jwtService.createRefreshToken(Map.of(UID, subject), subject);

            String hash = "#access="  + url(access) +
                          "&refresh=" + url(refresh);

            getRedirectStrategy().sendRedirect(request, response, frontendBaseUrl + "/auth/callback" + hash);
            return;
        }

        // 3) 첫 소셜 로그인(미가입): 프리필용 임시 토큰(5분 = 300초) → /signup#signup_ticket=...&social=...
        Map<String, Object> prefill = new HashMap<>();
        prefill.put(EMAIL, email);
        if (providerUp != null) prefill.put(PROVIDER, providerUp);
        if (name != null)       prefill.put("name", name);
        if (provId != null)     prefill.put(PROVIDER_ID, provId);
        prefill.put("purpose", "signup"); // ← 목적 태그 추가(컨트롤러에서 검증)

        // 임시 토큰 subject: providerId 우선, 없으면 email 사용
        String tempSubject = (providerUp != null && provId != null)
                ? (providerUp + ":" + provId)
                : ("SOCIAL_PREFILL:" + email);

        long ttlSeconds = 5 * 60; // ✅ JwtService는 "초 단위" TTL
        String signupTicket = jwtService.createTempToken(tempSubject, prefill, ttlSeconds);

        String hash = "#signup_ticket=" + url(signupTicket) + "&social=" + safe(provider);
        getRedirectStrategy().sendRedirect(request, response, frontendBaseUrl + "/signup" + hash);
    }

    /* ====================== Provider attribute extractors ====================== */

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

    /* =============================== Helpers =============================== */

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
                } catch (Exception ignore) {
                    // reflection 실패 시 skip
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

    private static String url(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }
}
