// com.giproject.security.CustomOAuth2SuccessHandler.java
package com.giproject.security;

import com.giproject.entity.oauth.SocialAccount;
import com.giproject.entity.oauth.SocialAccount.Provider;
import com.giproject.repository.oauth.SocialAccountRepo;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler implements org.springframework.security.web.authentication.AuthenticationSuccessHandler {

    private final SocialAccountRepo socialAccountRepo;

    @Value("${frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        String registrationId = token.getAuthorizedClientRegistrationId(); // "naver", "kakao", "google"
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String providerUserId = null;
        String email = null;
        Provider provider = Provider.valueOf(registrationId.toUpperCase());

        // 프로바이더별 id/email 추출
        if ("naver".equalsIgnoreCase(registrationId)) {
            Map<String, Object> resp = (Map<String, Object>) oAuth2User.getAttributes().get("response");
            if (resp != null) {
                Object idObj = resp.get("id");
                providerUserId = (idObj != null) ? String.valueOf(idObj) : null;
                email = (String) resp.get("email");
            }
        } else if ("kakao".equalsIgnoreCase(registrationId)) {
            Map<String, Object> attrs = (Map<String, Object>) oAuth2User.getAttributes();
            Object idObj = attrs.get("id");
            providerUserId = (idObj != null) ? String.valueOf(idObj) : null;
            Map<String, Object> kakaoAccount = (Map<String, Object>) attrs.get("kakao_account");
            if (kakaoAccount != null) {
                email = (String) kakaoAccount.get("email");
            }
        } else if ("google".equalsIgnoreCase(registrationId)) {
            providerUserId = (String) oAuth2User.getAttributes().get("sub");
            email = (String) oAuth2User.getAttributes().get("email");
        }

        if (providerUserId == null) {
            log.warn("Provider user id not found: {}", registrationId);
            response.sendRedirect(frontendBaseUrl + "/login?error=social_profile_missing");
            return;
        }

        // ★ 람다에서 사용할 final 복사본
        final String pUid = providerUserId;
        final String em = email;
        final Provider prov = provider;

        // 소셜 계정 조회/생성
        var acc = socialAccountRepo.findByProviderAndProviderUserId(prov, pUid)
                .orElseGet(() -> socialAccountRepo.save(
                        SocialAccount.builder()
                                .provider(prov)
                                .providerUserId(pUid)
                                .email(em)
                                .build()
                ));

        if (acc.getLoginId() != null) {
            // 이미 연결됨 → 프론트로 성공 리다이렉트 (원하면 JWT 발급 흐름과 연결)
            response.sendRedirect(frontendBaseUrl + "/?social=ok");
            return;
        }

        // 미연결 → 가입 완료 폼을 위한 1회성 티켓 발급
        String ticket = UUID.randomUUID().toString();
        acc.setSignupTicket(ticket);
        acc.setSignupTicketExpireAt(LocalDateTime.now().plusMinutes(10));
        acc.setEmail(em);
        socialAccountRepo.save(acc);

        String url = frontendBaseUrl + "/signup"
                + "?ticket=" + URLEncoder.encode(ticket, StandardCharsets.UTF_8)
                + (em != null ? "&email=" + URLEncoder.encode(em, StandardCharsets.UTF_8) : "")
                + "&provider=" + registrationId;

        response.sendRedirect(url);
    }
}
