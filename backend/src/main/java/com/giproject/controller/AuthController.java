// src/main/java/com/giproject/controller/AuthController.java
package com.giproject.controller;

import com.giproject.dto.auth.SignupRequest;
import com.giproject.dto.member.MemberDTO;
import com.giproject.email.EmailVerificationService;
import com.giproject.security.JwtService;
import com.giproject.service.auth.SimpleSignupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.Map;

import org.springframework.http.ResponseEntity;
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

    /** ⭐ 일반 회원가입 */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req, BindingResult br) {
        // 1. DTO 유효성 검증
        if (br.hasErrors()) {
            var errors = br.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .toList();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "VALIDATION_ERROR",
                    "message", errors
            ));
        }

        // 2. 이메일 인증 여부 확인
        if (!emailVerificationService.isVerified(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "EMAIL_NOT_VERIFIED",
                    "message", "이메일 인증을 완료해주세요."
            ));
        }

        try {
            // 3. 회원가입 실행
            MemberDTO result = signupService.signup(req);

            // 4. 응답에는 생성 시간(createdDateTime)도 포함됨
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "member", result
            ));

        } catch (IllegalArgumentException ex) {
            // ex.getMessage() 예: LOGIN_ID_TAKEN, EMAIL_TAKEN
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

    /** ⭐ ID 중복 + 형식 검증 */
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

    /** 쿠키 우선, 없으면 Authorization: Bearer */
    private String extractToken(String cookieToken, String authHeader) {
        if (cookieToken != null && !cookieToken.isBlank()) return cookieToken;
        if (authHeader != null && authHeader.startsWith("Bearer ")) return authHeader.substring(7);
        return null;
    }
}
