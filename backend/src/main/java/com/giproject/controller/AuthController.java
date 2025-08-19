package com.giproject.controller;

import com.giproject.dto.auth.SignupRequest;
import com.giproject.dto.member.MemberDTO;
import com.giproject.service.auth.SimpleSignupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@Log4j2
public class AuthController {

    private final SimpleSignupService signupService;

    /** 일반 회원가입 엔드포인트 */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req, BindingResult br) {
        // 1) 바인딩/검증 에러를 즉시 확인
        if (br.hasErrors()) {
            var errors = br.getFieldErrors().stream()
                    .map(e -> e.getField() + ": " + e.getDefaultMessage())
                    .toList();
            log.warn("Signup validation errors: {}", errors);
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            // 2) 서비스 호출
            MemberDTO result = signupService.signup(req);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException ex) {
            // 예: 이미 사용 중인 ID, 잘못된 role 등
            log.warn("Signup failed (bad request): {}", ex.getMessage());
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            // 예기치 않은 오류 → 서버 에러
            log.error("Signup failed (server error)", ex);
            return ResponseEntity.internalServerError().body("회원가입 중 오류가 발생했습니다.");
        }
    }
}