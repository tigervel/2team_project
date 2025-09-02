package com.giproject.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.Map;

@Component
@Log4j2
@RequiredArgsConstructor
public class JwtTokenUtils {

    @Value("${jwt.secret}")
    private String secretKey;

    // 토큰 생성 메서드 (인스턴스)
    public String generateToken(Map<String, Object> valueMap, int min) {
        SecretKey key = null;
        
        try {
            key = Keys.hmacShaKeyFor(secretKey.getBytes("UTF-8"));
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

        String jwtStr = Jwts.builder()
                .setHeader(Map.of("typ", "JWT"))
                .setClaims(valueMap)
                .setIssuedAt(Date.from(ZonedDateTime.now().toInstant()))
                .setExpiration(Date.from(ZonedDateTime.now().plusMinutes(min).toInstant()))
                .signWith(key)
                .compact();

        return jwtStr;
    }

    // 토큰 검증 메서드 (인스턴스)
    public Map<String, Object> validateToken(String token) {
        Map<String, Object> claim = null;

        try {
            SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes("UTF-8"));

            claim = Jwts.parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            throw new CustomJWTException("Token validation failed: " + e.getMessage());
        }

        return claim;
    }

    // Request에서 사용자 정보를 추출하는 인스턴스 메서드
    public UserInfo getUserInfoFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        
        String token = authHeader.substring(7);
        
        try {
            Map<String, Object> claims = this.validateToken(token);
            return new UserInfo(claims);
        } catch (Exception e) {
            log.warn("토큰 검증 실패: {}", e.getMessage());
            return null;
        }
    }

    // 사용자 정보를 담는 내부 클래스
    public static class UserInfo {
        private final String authorId;
        private final String[] roles;
        
        public UserInfo(Map<String, Object> claims) {
            this.authorId = (String) claims.get("sub");
            Object rolesObj = claims.get("roles");
            if (rolesObj instanceof String[]) {
                this.roles = (String[]) rolesObj;
            } else if (rolesObj instanceof String) {
                this.roles = new String[]{(String) rolesObj};
            } else {
                this.roles = new String[0];
            }
        }
        
        public String getAuthorId() {
            return authorId;
        }
        
        public String[] getRoles() {
            return roles;
        }
        
        public boolean hasRole(String role) {
            if (roles == null) return false;
            for (String userRole : roles) {
                if (role.equals(userRole)) {
                    return true;
                }
            }
            return false;
        }
        
        public boolean isAdmin() {
            return hasRole("ADMIN") || (authorId != null && authorId.toLowerCase().contains("admin"));
        }
    }
}