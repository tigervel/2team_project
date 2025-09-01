// src/main/java/com/giproject/controller/TokenAuthController.java
package com.giproject.controller;

import static com.giproject.security.jwt.JwtClaimKeys.EMAIL;
import static com.giproject.security.jwt.JwtClaimKeys.PROVIDER;
import static com.giproject.security.jwt.JwtClaimKeys.PROVIDER_ID;
import static com.giproject.security.jwt.JwtClaimKeys.ROLES;
import static com.giproject.security.jwt.JwtClaimKeys.UID;

import com.giproject.entity.account.UserIndex;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.entity.oauth.SocialAccount;
import com.giproject.repository.account.UserIndexRepo;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;
import com.giproject.repository.oauth.SocialAccountRepo;
import com.giproject.security.JwtService;

import java.time.LocalDateTime;
import java.util.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class TokenAuthController {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;
    private final UserIndexRepo userIndexRepo;
    private final SocialAccountRepo socialAccountRepo;

    private final PasswordEncoder passwordEncoder;

    // ===== 0) 일반 로그인 =====
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getLoginId(), req.getPassword())
            );

            String access  = jwtService.generateAccessToken(auth);
            String refresh = jwtService.generateRefreshToken(auth);

            return ResponseEntity.ok(Map.of(
                "accessToken", access,
                "refreshToken", refresh
            ));
        } catch (BadCredentialsException | UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("아이디 또는 비밀번호가 올바르지 않습니다.");
        } catch (LockedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("잠긴 계정입니다. 관리자에게 문의하세요.");
        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비활성화된 계정입니다. 관리자에게 문의하세요.");
        } catch (AccountExpiredException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("계정 사용기간이 만료되었습니다.");
        } catch (CredentialsExpiredException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호 사용기간이 만료되었습니다.");
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인에 실패했습니다.");
        }
    }

    @Data
    static class LoginReq {
        private String loginId;
        private String password;
    }

    // ===== 1) 소셜 첫가입 컨텍스트 =====
    @GetMapping("/social/signup-context")
    public ResponseEntity<SignupContextDTO> signupContext(@RequestParam("ticket") String ticket) {
        if (ticket == null || ticket.isBlank()) return ResponseEntity.noContent().build();
        try {
            Map<String, Object> claims = jwtService.parseTempToken(ticket);

            String email      = (String) claims.get(EMAIL);
            String provider   = (String) claims.get(PROVIDER);
            String nameMaybe  = claims.get("name") instanceof String ? (String) claims.get("name") : null;

            if (email == null || email.isBlank()) return ResponseEntity.noContent().build();
            return ResponseEntity.ok(new SignupContextDTO(email, provider, nameMaybe));
        } catch (Exception e) {
            return ResponseEntity.noContent().build();
        }
    }

    @Data @AllArgsConstructor
    static class SignupContextDTO {
        private String email;
        private String provider;
        private String name; // 프리필용(없을 수 있음)
    }

    // ===== 2) 소셜 첫가입 완료 =====
    @PostMapping("/social/complete-signup")
    public ResponseEntity<?> completeSignup(@RequestBody CompleteSignupReq req) {

        // 2-0) 티켓 파싱
        if (req.getSignupTicket() == null || req.getSignupTicket().isBlank()) {
            return ResponseEntity.badRequest().body("NO_SIGNUP_TICKET");
        }

        final Map<String, Object> stClaims;
        try {
            stClaims = jwtService.parseTempToken(req.getSignupTicket());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("SIGNUP_TICKET_EXPIRED");
        }

        final String emailFromSocial = (String) stClaims.get(EMAIL);
        final String providerStr     = (String) stClaims.get(PROVIDER);     // ex) GOOGLE / KAKAO / NAVER (대문자 기대)
        final String providerId      = (String) stClaims.get(PROVIDER_ID);  // ex) sub 또는 id

        log.info("[complete-signup] claims EMAIL={}, PROVIDER={}, PROVIDER_ID={}, rawClaims={}",
                emailFromSocial, providerStr, providerId, stClaims);

        if (emailFromSocial == null || emailFromSocial.isBlank()) {
            log.warn("[complete-signup] EMAIL missing in signup ticket -> EMAIL_REQUIRED");
            return ResponseEntity.badRequest().body("EMAIL_REQUIRED");
        }
        if (providerStr == null || providerStr.isBlank()) {
            return ResponseEntity.badRequest().body("PROVIDER_REQUIRED");
        }
        if (providerId == null || providerId.isBlank()) {
            return ResponseEntity.badRequest().body("PROVIDER_ID_REQUIRED");
        }

        // 2-1) 입력값 검증
        if (req.getLoginId() == null || req.getLoginId().isBlank()) {
            return ResponseEntity.badRequest().body("LOGIN_ID_REQUIRED");
        }
        if (req.getRole() == null || req.getRole().isBlank()) {
            return ResponseEntity.badRequest().body("ROLE_REQUIRED");
        }
        if (userIndexRepo.existsByLoginId(req.getLoginId())) {
            return ResponseEntity.badRequest().body("LOGIN_ID_TAKEN");
        }

        final UserIndex.Role domainRole;
        try {
            domainRole = UserIndex.Role.valueOf(req.getRole().toUpperCase()); // SHIPPER / DRIVER / ADMIN
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("INVALID_ROLE");
        }

        final LocalDateTime now = LocalDateTime.now();

        // 2-2) 저장 직전 값 로깅
        log.info("[complete-signup] to save user_index loginId={}, email={}, provider={}, providerId={}",
                req.getLoginId(), emailFromSocial, providerStr, providerId);

        // 2-3) user_index 저장 (★ email/provider/providerId/타임스탬프 포함)
        UserIndex ui = UserIndex.builder()
                .loginId(req.getLoginId())
                .email(emailFromSocial)   // ★ NOT NULL 방지
                .provider(providerStr)
                .providerId(providerId)
                .role(domainRole)
                .createdAt(now)
                .updatedAt(now)
                .build();

        // 최종 방어
        if (ui.getEmail() == null) {
            log.error("[complete-signup] ui.email is NULL just before save! ui={}", ui);
            return ResponseEntity.badRequest().body("EMAIL_REQUIRED");
        }
        userIndexRepo.save(ui);

        // 2-4) 본 테이블 저장 (비밀번호 암호화)
        String encodedPw = passwordEncoder.encode(req.getPassword());

        switch (domainRole) {
            case SHIPPER -> {
                Member m = Member.builder()
                        .memId(req.getLoginId())
                        .memPw(encodedPw)
                        .memEmail(emailFromSocial)
                        .memName(req.getName())
                        .memPhone(req.getPhone())
                        .memAddress(req.getAddress())
                        .memCreateIdDateTime(now)
                        .build();
                memberRepository.save(m);
            }
            case DRIVER -> {
                CargoOwner c = CargoOwner.builder()
                        .cargoId(req.getLoginId())
                        .cargoPw(encodedPw)
                        .cargoEmail(emailFromSocial)
                        .cargoName(req.getName())
                        .cargoPhone(req.getPhone())
                        .cargoAddress(req.getAddress())
                        .cargoCreatedDateTime(now)
                        .build();
                cargoOwnerRepository.save(c);
            }
            case ADMIN -> {
                // 필요 시 ADMIN 도메인 스키마에 맞게 처리
                Member m = Member.builder()
                        .memId(req.getLoginId())
                        .memPw(encodedPw)
                        .memEmail(emailFromSocial)
                        .memName(req.getName())
                        .memPhone(req.getPhone())
                        .memAddress(req.getAddress())
                        .memCreateIdDateTime(now)
                        .build();
                memberRepository.save(m);
            }
        }

        // 2-5) social_account 업서트
        SocialAccount.Provider providerEnum;
        try {
            providerEnum = SocialAccount.Provider.valueOf(providerStr.toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("UNSUPPORTED_PROVIDER");
        }

        SocialAccount sa = socialAccountRepo
                .findByProviderAndProviderUserId(providerEnum, providerId)
                .orElseGet(() -> SocialAccount.builder()
                        .provider(providerEnum)
                        .providerUserId(providerId)
                        .build());

        sa.setEmail(emailFromSocial);
        sa.setLoginId(req.getLoginId());
        sa.setLinkedAt(now);
        sa.setSignupTicket(null);
        sa.setSignupTicketExpireAt(null);
        socialAccountRepo.save(sa);

        // 2-6) JWT 발급 (roles: ROLE_USER/ROLE_ADMIN + ROLE_SHIPPER/ROLE_DRIVER/ROLE_ADMIN)
        List<String> roles = new ArrayList<>();
        roles.add("ROLE_" + domainRole.name());
        if (domainRole == UserIndex.Role.ADMIN) {
            roles.add("ROLE_ADMIN");
        } else {
            roles.add("ROLE_USER");
        }

        Map<String, Object> loginClaims = new HashMap<>();
        loginClaims.put(EMAIL, emailFromSocial);
        loginClaims.put(UID, req.getLoginId());
        loginClaims.put(ROLES, new ArrayList<>(new LinkedHashSet<>(roles)));
        loginClaims.put(PROVIDER, providerStr.toUpperCase());
        loginClaims.put(PROVIDER_ID, providerId);

        String subject = req.getLoginId(); // 내부 로그인키
        String access  = jwtService.createAccessToken(loginClaims, subject);
        String refresh = jwtService.createRefreshToken(Map.of(UID, subject), subject);

        return ResponseEntity.ok(Map.of(
            "accessToken", access,
            "refreshToken", refresh
        ));
    }

    @Data
    static class CompleteSignupReq {
        private String signupTicket;
        private String role;      // SHIPPER / DRIVER / ADMIN
        private String loginId;
        private String password;
        private String name;
        private String email;     // (프런트 보낼 수 있으나 ticket 우선)
        private String phone;
        private String address;
    }

    // ===== 3) 리프레시 → 액세스 재발급 =====
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshReq req) {
        String refreshToken = req.getRefreshToken();
        if (refreshToken == null || refreshToken.isBlank() || !jwtService.validate(refreshToken)) {
            return ResponseEntity.status(401).body("INVALID_REFRESH");
        }

        String username = jwtService.getUsername(refreshToken);
        var userDetails = userDetailsService.loadUserByUsername(username);
        var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        String access = jwtService.generateAccessToken(authentication);

        return ResponseEntity.ok(Map.of("accessToken", access, "refreshToken", refreshToken));
    }

    @Data
    static class RefreshReq {
        private String refreshToken;
    }

    // ===== 4) 로그아웃 =====
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // ===== 5) 아이디 찾기 =====
    @GetMapping("/find-id")
    public ResponseEntity<?> findId(@RequestParam("email") String email) {
        var opt = memberRepository.findByMemEmail(email);
        if (opt.isPresent()) {
            return ResponseEntity.ok(Map.of("loginId", opt.get().getMemId()));
        }
        return ResponseEntity.status(404).body("NOT_FOUND");
    }
}
