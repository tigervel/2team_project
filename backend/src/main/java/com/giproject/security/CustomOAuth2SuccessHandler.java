// com.giproject.security.CustomOAuth2SuccessHandler.java
package com.giproject.security;

import com.giproject.entity.oauth.SocialAccount;
import com.giproject.entity.oauth.SocialAccount.Provider;
import com.giproject.repository.oauth.SocialAccountRepo;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
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
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final SocialAccountRepo socialAccountRepo;
    private final JwtService jwtService;

    @Value("${frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            log.warn("Unexpected authentication type: {}", authentication.getClass());
            getRedirectStrategy().sendRedirect(request, response,
                    frontendBaseUrl + "/login?error=unsupported_auth_type");
            return;
        }

        final String registrationId = oauthToken.getAuthorizedClientRegistrationId(); // naver/kakao/google
        final OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String providerUserId = null;
        String email = null;
        Provider provider;
        try {
            provider = Provider.valueOf(registrationId.toUpperCase());
        } catch (Exception e) {
            log.warn("Unknown provider: {}", registrationId);
            getRedirectStrategy().sendRedirect(request, response,
                    frontendBaseUrl + "/login?error=unknown_provider");
            return;
        }

        if ("naver".equalsIgnoreCase(registrationId)) {
            Map<String, Object> resp = castMap(oAuth2User.getAttributes().get("response"));
            if (resp != null) {
                providerUserId = str(resp.get("id"));
                email = str(resp.get("email"));
            }
        } else if ("kakao".equalsIgnoreCase(registrationId)) {
            Map<String, Object> attrs = oAuth2User.getAttributes();
            providerUserId = str(attrs.get("id"));
            Map<String, Object> kakaoAccount = castMap(attrs.get("kakao_account"));
            if (kakaoAccount != null) {
                email = str(kakaoAccount.get("email"));
            }
        } else if ("google".equalsIgnoreCase(registrationId)) {
            providerUserId = str(oAuth2User.getAttributes().get("sub"));
            email = str(oAuth2User.getAttributes().get("email"));
        }

        if (providerUserId == null) {
            log.warn("Provider user id not found: {}", registrationId);
            getRedirectStrategy().sendRedirect(request, response,
                    frontendBaseUrl + "/login?error=social_profile_missing");
            return;
        }

        final String pUid = providerUserId;
        final String em = email;

        SocialAccount acc = socialAccountRepo.findByProviderAndProviderUserId(provider, pUid)
                .orElseGet(() -> socialAccountRepo.save(
                        SocialAccount.builder()
                                .provider(provider)
                                .providerUserId(pUid)
                                .email(em)
                                .build()
                ));

        // 이미 내 계정과 연결된 경우 → 액세스/리프레시 토큰 발급 후 프론트로
        if (acc.getLoginId() != null && !acc.getLoginId().isBlank()) {
            String subject = acc.getLoginId();

            // ✅ JwtService 시그니처에 맞춰 사용
            String accessToken  = jwtService.generateAccessToken(subject);
            String refreshToken = jwtService.generateRefreshToken(subject);

            // 리프레시 토큰은 HttpOnly 쿠키로 (운영 HTTPS에서는 setSecure(true) + SameSite=None 권장)
            Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
            refreshCookie.setHttpOnly(true);
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge((int) jwtService.getAccessExpiresInSeconds()); // 필요시 별도 refresh TTL로 변경
            // refreshCookie.setSecure(true); // PROD(HTTPS)에서
            response.addCookie(refreshCookie);
            // SameSite 설정 필요 시:
            // response.addHeader("Set-Cookie", "refresh_token=" + refreshToken + "; Path=/; HttpOnly; Max-Age=604800; SameSite=Lax");

            String target = frontendBaseUrl
                    + "/member/oauth-success?token="
                    + URLEncoder.encode(accessToken, StandardCharsets.UTF_8);

            getRedirectStrategy().sendRedirect(request, response, target);
            return;
        }

        // 미연결(첫 소셜 로그인) → 가입 완료 폼 유도 (10분짜리 1회 티켓)
        String ticket = UUID.randomUUID().toString();
        acc.setSignupTicket(ticket);
        acc.setSignupTicketExpireAt(LocalDateTime.now().plusMinutes(10));
        acc.setEmail(em);
        socialAccountRepo.save(acc);

        Cookie c = new Cookie("signup_ticket", ticket);
        c.setHttpOnly(true);
        c.setPath("/");
        c.setMaxAge(10 * 60);
        // c.setSecure(true); // PROD(HTTPS)에서
        response.addCookie(c);

        String url = frontendBaseUrl + "/signup"
                + "?provider=" + URLEncoder.encode(registrationId, StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(request, response, url);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castMap(Object obj) {
        if (obj instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return null;
    }

    private String str(Object obj) {
        return Optional.ofNullable(obj).map(String::valueOf).orElse(null);
    }
}
