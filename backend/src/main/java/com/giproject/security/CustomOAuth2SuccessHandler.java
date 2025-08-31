package com.giproject.security;

import com.giproject.repository.member.MemberRepository;
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
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;             // 액세스/리프레시 & 프리필(임시) 토큰 생성
    private final MemberRepository memberRepository; // 가입 여부 확인

    @Value("${frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        String provider = token.getAuthorizedClientRegistrationId(); // google | kakao | naver
        OAuth2User oAuth2User = token.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = extractEmail(provider, attributes);
        String name  = extractName(provider, attributes);

        log.info("OAuth2 success provider={}, email={}, name={}", provider, email, name);

        // 1) 이메일 동의 누락 → 가입 페이지로 (프리필 불가)
        if (email == null || email.isBlank()) {
            String redirect = frontendBaseUrl + "/signup?social=" + provider + "&reason=no_email";
            getRedirectStrategy().sendRedirect(request, response, redirect);
            return;
        }

        // 2) 기존 회원: 액세스/리프레시 토큰 발급 → 콜백 페이지로 전달(#hash)
        boolean exists = memberRepository.existsByMemEmail(email);
        if (exists) {
            Map<String, Object> claims = Map.of(
                "memEmail", email,
                "provider", provider
            );

            String access  = jwtService.createAccessToken(claims);
            String refresh = jwtService.createRefreshToken(claims);

            // 해시(#)로 전달하면 네트워크/서버 로그에 덜 남고 프론트에서만 읽을 수 있음
            String hash = "#access="  + URLEncoder.encode(access,  StandardCharsets.UTF_8)
                        + "&refresh=" + URLEncoder.encode(refresh, StandardCharsets.UTF_8);

            getRedirectStrategy().sendRedirect(request, response, frontendBaseUrl + "/auth/callback" + hash);
            return;
        }

        // 3) 첫 소셜 로그인(미가입): 프리필용 임시 토큰(5분) 발급 → 가입 페이지로 전달(#hash)
        Map<String, Object> prefillClaims = Map.of(
            "email", email,
            "provider", provider,
            "name", name
        );
        String signupTicket = jwtService.createTempToken(prefillClaims, 5 * 60); // 5분 유효

        String hash = "#signup_ticket=" + URLEncoder.encode(signupTicket, StandardCharsets.UTF_8)
                    + "&social=" + provider;

        getRedirectStrategy().sendRedirect(request, response, frontendBaseUrl + "/signup" + hash);
    }

    // ====== Provider별 이메일/이름 추출 유틸 ======
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
}
