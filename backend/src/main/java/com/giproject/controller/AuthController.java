package com.giproject.controller;

import com.giproject.dto.auth.SignupRequest;
import com.giproject.dto.member.MemberDTO;
import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.email.EmailVerificationService;
import com.giproject.security.JwtService;
import com.giproject.service.auth.SimpleSignupService;
import com.giproject.service.auth.CustomUserDetailsService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@Log4j2
public class AuthController {

    private final SimpleSignupService signupService;
    private final JwtService jwtService;
    private final EmailVerificationService emailVerificationService;
    private final CustomUserDetailsService userDetailsService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req, BindingResult br) {
        if (br.hasErrors()) {
            var errors = br.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .toList();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "VALIDATION_ERROR",
                    "message", errors
            ));
        }

        if (!emailVerificationService.isVerified(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "EMAIL_NOT_VERIFIED",
                    "message", "이메일 인증을 완료해주세요."
            ));
        }

        try {
            Object result = signupService.signup(req);

            UserDetails userDetails = switch (result) {
                case MemberDTO m -> userDetailsService.loadUserByUsername(m.getMemId());
                case CargoOwnerDTO c -> userDetailsService.loadUserByUsername(c.getCargoId());
                default -> throw new IllegalStateException("알 수 없는 회원 타입");
            };

            var auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            String access  = jwtService.generateAccessToken(auth);
            String refresh = jwtService.generateRefreshToken(auth);

            if (result instanceof MemberDTO m) m.withTokens(access, refresh);
            else if (result instanceof CargoOwnerDTO c) c.withTokens(access, refresh);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "member", result
            ));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "VALIDATION_ERROR",
                    "message", ex.getMessage()
            ));
        } catch (Exception ex) {
            log.error("회원가입 실패", ex);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "SERVER_ERROR",
                    "message", "회원가입 처리 중 문제가 발생했습니다."
            ));
        }
    }

    @GetMapping("/check-id")
    public ResponseEntity<?> checkId(@RequestParam("loginId") String loginId) {
        if (loginId == null || loginId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "available", false,
                    "message", "아이디는 필수입니다."
            ));
        }
        if (!loginId.matches("^[A-Za-z0-9]+$")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "available", false,
                    "message", "아이디는 영문/숫자만 가능합니다."
            ));
        }
        if (loginId.length() < 6 || loginId.length() > 15) {
            return ResponseEntity.badRequest().body(Map.of(
                    "available", false,
                    "message", "아이디는 6~15자여야 합니다."
            ));
        }

        boolean exists = signupService.existsByLoginId(loginId);
        if (exists) {
            return ResponseEntity.ok(Map.of(
                    "available", false,
                    "message", "이미 사용 중인 아이디입니다."
            ));
        }
        return ResponseEntity.ok(Map.of(
                "available", true,
                "message", "사용 가능한 아이디입니다."
        ));
    }

    private String extractToken(String cookieToken, String authHeader) {
        if (cookieToken != null && !cookieToken.isBlank()) return cookieToken;
        if (authHeader != null && authHeader.startsWith("Bearer ")) return authHeader.substring(7);
        return null;
    }
}
