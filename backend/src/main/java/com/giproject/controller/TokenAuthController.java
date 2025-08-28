package com.giproject.controller;

import com.giproject.entity.member.Member;
import com.giproject.repository.member.MemberRepository;
import com.giproject.security.JwtService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class TokenAuthController {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final MemberRepository memberRepository;

    // =========================
    // 0) 일반 로그인 (쿠키 X, JSON만)
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req) {
        // 1) 아이디/비번 인증
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getLoginId(), req.getPassword())
        );

        // 2) 토큰 생성 후 JSON 반환 (쿠키 사용 안 함)
        Map<String, Object> claims = Map.of("memId", req.getLoginId());
        String access  = jwtService.createAccessToken(claims);
        String refresh = jwtService.createRefreshToken(claims);

        return ResponseEntity.ok(Map.of(
                "accessToken", access,
                "refreshToken", refresh
        ));
    }

    @Data
    static class LoginReq {
        private String loginId;
        private String password;
    }

    // =========================
    // 1) 소셜 첫가입 프리필 컨텍스트
    // =========================
    /**
     * 해시(#)로 전달된 signup_ticket을 프론트가 꺼내서
     * /api/auth/social/signup-context?ticket=... 로 넘겨주면,
     * 이메일/프로바이더/이름을 파싱해 돌려준다.
     */
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

    /**
     * 소셜 첫가입 완료.
     * Body로 signupTicket(=임시토큰)과 가입 폼 데이터를 받아서 회원 생성 후
     * 곧바로 access/refresh 토큰을 JSON으로 반환한다. (쿠키 X)
     */
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

        // 중복 방지
        if (memberRepository.existsByMemEmail(emailFromSocial)) {
            return ResponseEntity.badRequest().body("EMAIL_ALREADY_EXISTS");
        }

        // 실제 회원 생성 (필드명은 프로젝트 엔티티에 맞게 조정)
        Member m = new Member();
        m.setMemId(req.getLoginId());
        m.setMemPw(req.getPassword()); // TODO: PasswordEncoder로 해시 적용 권장
        m.setMemEmail(emailFromSocial);
        m.setMemName(req.getName());
        m.setMemPhone(req.getPhone());
        m.setMemAddress(req.getAddress());
        memberRepository.save(m);

        // 가입 직후 자동 로그인: JSON으로 access/refresh 반환
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
        private String signupTicket; // ✅ 해시에서 꺼낸 ticket을 Body로 전달
        private String role;
        private String loginId;
        private String password;
        private String name;
        private String email;   // (선택) 폼에서 입력받은 이메일은 참고용, 실제 사용은 signupTicket의 email
        private String phone;
        private String address;
    }

    // =========================
    // 2) 리프레시 → 액세스 발급 (쿠키 X, JSON만)
    // =========================
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshReq req) {
        String refresh = req.getRefreshToken();
        if (refresh == null || refresh.isBlank() || !jwtService.validate(refresh)) {
            return ResponseEntity.status(401).body("INVALID_REFRESH");
        }

        var claims   = jwtService.parseToken(refresh);
        String email = claims.get("memEmail", String.class);
        String memId = claims.get("memId", String.class);
        String provider = claims.get("provider", String.class);

        Map<String, Object> accessClaims = (email != null)
                ? Map.of("memEmail", email, "provider", provider)
                : Map.of("memId", memId);

        String access = jwtService.createAccessToken(accessClaims);

        // (선택) refresh 로테이션 원하면 아래처럼 새 refresh도 함께 내려주기
        // String newRefresh = jwtService.createRefreshToken(accessClaims);
        // return ResponseEntity.ok(Map.of("accessToken", access, "refreshToken", newRefresh));

        return ResponseEntity.ok(Map.of("accessToken", access));
    }

    @Data
    static class RefreshReq {
        private String refreshToken;
    }

    // =========================
    // 3) 로그아웃 (클라이언트가 localStorage 삭제)
    // =========================
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // 쿠키 사용 안 하므로 서버가 무효화할 상태는 없음
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
