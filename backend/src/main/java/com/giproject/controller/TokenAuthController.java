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
import com.giproject.repository.account.UserIndexRepository;
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

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@Slf4j
public class TokenAuthController {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;
    private final UserIndexRepository userIndexRepo;
    private final SocialAccountRepo socialAccountRepo;

    private final PasswordEncoder passwordEncoder;

    /* ===== 공통 헬퍼 ===== */
    private ResponseEntity<ApiError> error(String code, String msg, HttpStatus status) {
        return ResponseEntity.status(status).body(new ApiError(code, msg));
    }

    private Map<String, String> createTokens(Map<String, Object> claims, String subject) {
        return Map.of(
            "accessToken", jwtService.createAccessToken(claims, subject),
            "refreshToken", jwtService.createRefreshToken(Map.of(UID, subject), subject)
        );
    }

    private void saveUserByRole(UserIndex.Role role, CompleteSignupReq req, String encodedPw, LocalDateTime now) {
        switch (role) {
            case SHIPPER, ADMIN -> memberRepository.save(Member.builder()
                    .memId(req.getLoginId())
                    .memPw(encodedPw)
                    .memEmail(req.getEmail())
                    .memName(req.getName())
                    .memPhone(req.getPhone())
                    .memAddress(req.getAddress())
                    .memCreateIdDateTime(now)
                    .build());
            case DRIVER -> cargoOwnerRepository.save(CargoOwner.builder()
                    .cargoId(req.getLoginId())
                    .cargoPw(encodedPw)
                    .cargoEmail(req.getEmail())
                    .cargoName(req.getName())
                    .cargoPhone(req.getPhone())
                    .cargoAddress(req.getAddress())
                    .cargoCreatedDateTime(now)
                    .build());
        }
    }

    /* ===== 0) 일반 로그인 ===== */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getLoginId(), req.getPassword())
            );
            String access = jwtService.generateAccessToken(auth);
            String refresh = jwtService.generateRefreshToken(auth);
            return ResponseEntity.ok(Map.of("accessToken", access, "refreshToken", refresh));
        } catch (BadCredentialsException | UsernameNotFoundException e) {
            return error("BAD_CREDENTIALS", "아이디 또는 비밀번호가 올바르지 않습니다.", HttpStatus.UNAUTHORIZED);
        } catch (LockedException e) {
            return error("LOCKED", "잠긴 계정입니다. 관리자에게 문의하세요.", HttpStatus.UNAUTHORIZED);
        } catch (DisabledException e) {
            return error("DISABLED", "비활성화된 계정입니다. 관리자에게 문의하세요.", HttpStatus.UNAUTHORIZED);
        } catch (AccountExpiredException e) {
            return error("ACCOUNT_EXPIRED", "계정 사용기간이 만료되었습니다.", HttpStatus.UNAUTHORIZED);
        } catch (CredentialsExpiredException e) {
            return error("CREDENTIALS_EXPIRED", "비밀번호 사용기간이 만료되었습니다.", HttpStatus.UNAUTHORIZED);
        } catch (AuthenticationException e) {
            return error("AUTH_FAILED", "로그인에 실패했습니다.", HttpStatus.UNAUTHORIZED);
        }
    }

    @Data
    static class LoginReq { private String loginId; private String password; }

    /* ===== 1) 소셜 로그인 ===== */
    @PostMapping("/social/{provider}")
    public ResponseEntity<?> socialLogin(
            @PathVariable("provider") String provider,
            @RequestBody(required = false) Map<String,String> body) {

        if (body == null || body.isEmpty()) {
            return error("BODY_REQUIRED", "요청 본문이 필요합니다.", HttpStatus.BAD_REQUEST);
        }

        String providerUserId = body.get("providerId");
        String email = body.get("email");
        String name = body.get("name");

        if (providerUserId == null || providerUserId.isBlank())
            return error("PROVIDER_ID_REQUIRED", "소셜 제공자 ID가 필요합니다.", HttpStatus.BAD_REQUEST);
        if (email == null || email.isBlank())
            return error("EMAIL_REQUIRED", "이메일이 필요합니다.", HttpStatus.BAD_REQUEST);
        if (name == null || name.isBlank())
            return error("NAME_REQUIRED", "이름이 필요합니다.", HttpStatus.BAD_REQUEST);

        Optional<UserIndex> userOpt = userIndexRepo.findByProviderAndProviderId(provider.toUpperCase(), providerUserId);

        if (userOpt.isPresent()) {
            UserIndex ui = userOpt.get();
            List<String> roles = List.of(
                    "ROLE_" + ui.getRole().name(),
                    ui.getRole() == UserIndex.Role.ADMIN ? "ROLE_ADMIN" : "ROLE_USER"
            );
            Map<String,Object> claims = Map.of(
                    EMAIL, ui.getEmail(),
                    UID, ui.getLoginId(),
                    ROLES, roles,
                    PROVIDER, provider.toUpperCase(),
                    PROVIDER_ID, providerUserId
            );
            return ResponseEntity.ok(createTokens(claims, ui.getLoginId()));
        }

        String signupTicket = jwtService.createTempToken(
                Map.of(
                        "purpose", "signup",
                        EMAIL, email,
                        PROVIDER, provider.toUpperCase(),
                        PROVIDER_ID, providerUserId,
                        "name", name
                ),
                5
        );

        return ResponseEntity.ok(
                Map.of(
                        "signupRequired", true,
                        "signupTicket", signupTicket,
                        "email", email
                )
        );
    }


    /* ===== 2) 소셜 첫가입 컨텍스트 ===== */
    @GetMapping("/social/signup-context")
    public ResponseEntity<?> signupContext(@RequestParam("ticket") String ticket) {
        if (ticket == null || ticket.isBlank()) return error("TICKET_MISSING", "유효한 가입 티켓이 없습니다.", HttpStatus.NOT_FOUND);
        try {
            Map<String,Object> claims = jwtService.parseTempToken(ticket);
            if (!"signup".equalsIgnoreCase((String)claims.get("purpose")))
                return error("TICKET_INVALID", "가입용 티켓이 아닙니다.", HttpStatus.NOT_FOUND);

            String email = (String) claims.get(EMAIL);
            String provider = (String) claims.get(PROVIDER);
            String name = claims.get("name") instanceof String ? (String) claims.get("name") : null;
            if (email == null || email.isBlank()) return error("EMAIL_REQUIRED", "이메일 동의가 필요합니다.", HttpStatus.NOT_FOUND);

            return ResponseEntity.ok(new SignupContextDTO(email, provider, name));
        } catch (Exception e) {
            return error("TICKET_EXPIRED", "가입 티켓이 만료되었거나 올바르지 않습니다.", HttpStatus.NOT_FOUND);
        }
    }

    @Data @AllArgsConstructor
    static class SignupContextDTO { private String email; private String provider; private String name; }

    /* ===== 3) 소셜 첫가입 완료 ===== */
    @Transactional
    @PostMapping("/social/complete-signup")
    public ResponseEntity<?> completeSignup(@RequestBody CompleteSignupReq req) {
        if (req.getSignupTicket() == null || req.getSignupTicket().isBlank())
            return error("NO_SIGNUP_TICKET", "가입 티켓이 없습니다.", HttpStatus.BAD_REQUEST);

        Map<String,Object> stClaims;
        try {
            stClaims = jwtService.parseTempToken(req.getSignupTicket());
            if (!"signup".equalsIgnoreCase((String)stClaims.get("purpose")))
                return error("TICKET_INVALID","가입용 티켓이 아닙니다.", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return error("SIGNUP_TICKET_EXPIRED","가입 티켓이 만료되었거나 올바르지 않습니다.", HttpStatus.BAD_REQUEST);
        }

        final String emailFromSocial = (String) stClaims.get(EMAIL);
        final String providerStr = (String) stClaims.get(PROVIDER);
        final String providerId = (String) stClaims.get(PROVIDER_ID);

        if (emailFromSocial == null || emailFromSocial.isBlank()) return error("EMAIL_REQUIRED","이메일이 필요합니다.",HttpStatus.BAD_REQUEST);
        if (providerStr == null || providerStr.isBlank()) return error("PROVIDER_REQUIRED","제공자 정보가 누락되었습니다.",HttpStatus.BAD_REQUEST);
        if (providerId == null || providerId.isBlank()) return error("PROVIDER_ID_REQUIRED","제공자 ID가 누락되었습니다.",HttpStatus.BAD_REQUEST);
        if (req.getLoginId() == null || req.getLoginId().isBlank()) return error("LOGIN_ID_REQUIRED","아이디가 필요합니다.",HttpStatus.BAD_REQUEST);
        if (req.getRole() == null || req.getRole().isBlank()) return error("ROLE_REQUIRED","역할이 필요합니다.",HttpStatus.BAD_REQUEST);
        if (userIndexRepo.existsByLoginId(req.getLoginId()) || memberRepository.findByMemEmail(emailFromSocial).isPresent() || cargoOwnerRepository.findByCargoEmail(emailFromSocial).isPresent())
            return error("DUPLICATE","이미 존재하는 정보입니다.",HttpStatus.CONFLICT);

        UserIndex.Role domainRole;
        try { domainRole = UserIndex.Role.valueOf(req.getRole().toUpperCase()); }
        catch (IllegalArgumentException e) { return error("INVALID_ROLE","허용되지 않는 역할입니다.",HttpStatus.BAD_REQUEST); }

        LocalDateTime now = LocalDateTime.now();
        UserIndex ui = UserIndex.builder()
                .loginId(req.getLoginId())
                .email(emailFromSocial)
                .provider(providerStr.toUpperCase())
                .providerId(providerId)
                .role(domainRole)
                .createdAt(now)
                .updatedAt(now)
                .build();
        userIndexRepo.save(ui);

        String encodedPw = passwordEncoder.encode(req.getPassword());
        saveUserByRole(domainRole, req, encodedPw, now);

        SocialAccount.Provider providerEnum;
        try { providerEnum = SocialAccount.Provider.valueOf(providerStr.toUpperCase()); }
        catch (Exception e) { return error("UNSUPPORTED_PROVIDER","지원하지 않는 소셜 제공자입니다.",HttpStatus.BAD_REQUEST); }

        SocialAccount sa = socialAccountRepo.findByProviderAndProviderUserId(providerEnum, providerId)
                .orElseGet(() -> SocialAccount.builder().provider(providerEnum).providerUserId(providerId).build());
        sa.setUser(ui); sa.setEmail(emailFromSocial); sa.setLoginId(req.getLoginId()); sa.setLinkedAt(now); sa.setSignupTicket(null); sa.setSignupTicketExpireAt(null);
        socialAccountRepo.save(sa);

        List<String> roles = List.of("ROLE_" + domainRole.name(), domainRole == UserIndex.Role.ADMIN ? "ROLE_ADMIN" : "ROLE_USER");
        Map<String,Object> loginClaims = new HashMap<>();
        loginClaims.put(EMAIL,emailFromSocial); loginClaims.put(UID, req.getLoginId()); loginClaims.put(ROLES, roles); loginClaims.put(PROVIDER, providerEnum.name()); loginClaims.put(PROVIDER_ID, providerId);

        return ResponseEntity.ok(createTokens(loginClaims, req.getLoginId()));
    }

    @Data
    static class CompleteSignupReq { private String signupTicket; private String role; private String loginId; private String password; private String name; private String email; private String phone; private String address; }

    /* ===== 4) 리프레시 ===== */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshReq req) {
        if (req.getRefreshToken() == null || req.getRefreshToken().isBlank() || !jwtService.validate(req.getRefreshToken()))
            return error("INVALID_REFRESH","리프레시 토큰이 유효하지 않습니다.",HttpStatus.UNAUTHORIZED);

        String username = jwtService.getUsername(req.getRefreshToken());
        var userDetails = userDetailsService.loadUserByUsername(username);
        var auth = new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
        String access = jwtService.generateAccessToken(auth);
        return ResponseEntity.ok(Map.of("accessToken", access, "refreshToken", req.getRefreshToken()));
    }

    @Data static class RefreshReq { private String refreshToken; }

    /* ===== 5) 로그아웃 ===== */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() { return ResponseEntity.ok(Map.of("ok",true)); }

    /* ===== 6) 아이디 찾기 ===== */
    @GetMapping("/find-id")
    public ResponseEntity<Map<String,String>> findId(@RequestParam("email") String email) {
        return memberRepository.findByMemEmail(email)
                .map(m -> ResponseEntity.ok(Map.of("loginId", m.getMemId())))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "NOT_FOUND", "message", "일치하는 아이디가 없습니다.")));
    }


    @Data @AllArgsConstructor
    static class ApiError { private String code; private String message; }
}
