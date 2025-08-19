package com.giproject.controller;

import com.giproject.dto.auth.LoginRequest;
import com.giproject.dto.auth.TokenResponse;
import com.giproject.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class TokenAuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    /** ID/PW 로그인 → 토큰 발급 */
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest req) {
        var authToken = new UsernamePasswordAuthenticationToken(req.getLoginId(), req.getPassword());
        authenticationManager.authenticate(authToken); // 실패시 AuthenticationException → 401로 매핑

        String access  = jwtService.generateAccessToken(req.getLoginId());
        String refresh = jwtService.generateRefreshToken(req.getLoginId());

        return ResponseEntity.ok(new TokenResponse("Bearer", access, refresh, jwtService.getAccessExpiresInSeconds()));
    }

    /** 리프레시 토큰으로 새 access 발급 */
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestParam("refreshToken") String refreshToken) {
        if (!jwtService.validate(refreshToken)) {
            return ResponseEntity.status(401).build();
        }
        String username = jwtService.getUsername(refreshToken);
        String access = jwtService.generateAccessToken(username);
        return ResponseEntity.ok(new TokenResponse("Bearer", access, refreshToken, jwtService.getAccessExpiresInSeconds()));
    }

    /** (옵션) 로그아웃 훅 */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }
}