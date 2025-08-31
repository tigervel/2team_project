package com.giproject.controller;

import com.giproject.entity.member.Member;
import com.giproject.repository.member.MemberRepository;
import com.giproject.security.JwtService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class TokenAuthController {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final MemberRepository memberRepository;
    private final UserDetailsService userDetailsService;

    // =========================
    // 0) 일반 로그인 (쿠키 X, JSON만)
    // =========================
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
            // 아이디/비밀번호 불일치
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("아이디 또는 비밀번호가 올바르지 않습니다.");
        } catch (LockedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("잠긴 계정입니다. 관리자에게 문의하세요.");
        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("비활성화된 계정입니다. 관리자에게 문의하세요.");
        } catch (AccountExpiredException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("계정 사용기간이 만료되었습니다.");
        } catch (CredentialsExpiredException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("비밀번호 사용기간이 만료되었습니다.");
        } catch (AuthenticationException e) {
            // 그 외 인증 실패
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인에 실패했습니다.");
        }
    }

    @Data
    static class LoginReq {
        private String loginId;
        private String password;
    }

    // =========================
    // 1) 소셜 첫가입 프리필 컨텍스트
    // =========================
    @GetMapping("/social/signup-context")
    public ResponseEntity<SignupContextDTO> signupContext(@RequestParam("ticket") String ticket) {
        if (ticket == null || ticket.isBlank()) {
            return ResponseEntity.noContent().build();
        }
        try {
            Map<String, Object> claims = jwtService.parseTempToken(ticket);
            String email    = (String) claims.get("email");
            String provider = (String) claims.get("provider");
            String name     = (String) claims.get("name");
            if (email == null || email.isBlank()) return ResponseEntity.noContent().build();
            return ResponseEntity.ok(new SignupContextDTO(email, provider, name));
        } catch (Exception e) {
            return ResponseEntity.noContent().build();
        }
    }

    @Data @AllArgsConstructor
    static class SignupContextDTO {
        private String email;
        private String provider;
        private String name;
    }

    // =========================
    // 소셜 첫가입 완료 → 회원 생성 후 access/refresh 발급
    // =========================
    @PostMapping("/social/complete-signup")
    public ResponseEntity<?> completeSignup(@RequestBody CompleteSignupReq req) {
        if (req.getSignupTicket() == null || req.getSignupTicket().isBlank()) {
            return ResponseEntity.badRequest().body("NO_SIGNUP_TICKET");
        }

        Map<String, Object> stClaims;
        try {
            stClaims = jwtService.parseTempToken(req.getSignupTicket());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("SIGNUP_TICKET_EXPIRED");
        }

        String emailFromSocial = (String) stClaims.get("email");
        String provider        = (String) stClaims.get("provider");
        if (emailFromSocial == null || emailFromSocial.isBlank()) {
            return ResponseEntity.badRequest().body("EMAIL_REQUIRED");
        }

        if (memberRepository.existsByMemEmail(emailFromSocial)) {
            return ResponseEntity.badRequest().body("EMAIL_ALREADY_EXISTS");
        }

        Member m = new Member();
        m.setMemId(req.getLoginId());
        m.setMemPw(req.getPassword()); // TODO: 반드시 PasswordEncoder 적용 권장
        m.setMemEmail(emailFromSocial);
        m.setMemName(req.getName());
        m.setMemPhone(req.getPhone());
        m.setMemAddress(req.getAddress());
        memberRepository.save(m);

        Map<String, Object> loginClaims = Map.of("memEmail", emailFromSocial, "provider", provider);
        String access  = jwtService.createAccessToken(loginClaims);
        String refresh = jwtService.createRefreshToken(loginClaims);

        return ResponseEntity.ok(Map.of(
            "accessToken", access,
            "refreshToken", refresh
        ));
    }

    @Data
    static class CompleteSignupReq {
        private String signupTicket;
        private String role;
        private String loginId;
        private String password;
        private String name;
        private String email;
        private String phone;
        private String address;
    }

    // =========================
    // 2) 리프레시 → 액세스 발급
    // =========================
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

    // =========================
    // 3) 로그아웃
    // =========================
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("ok", true));
    }
    
    @GetMapping("/find-id")
    public ResponseEntity<?> findId(@RequestParam("email") String email) {
        var opt = memberRepository.findByMemEmail(email);
        if (opt.isPresent()) {
            return ResponseEntity.ok(Map.of("loginId", opt.get().getMemId()));
        }
        return ResponseEntity.status(404).body("NOT_FOUND");
    }
}
