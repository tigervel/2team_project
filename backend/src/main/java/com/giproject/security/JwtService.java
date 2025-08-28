package com.giproject.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.secret:CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_256_BITS_MINIMUM_1234567890}")
    private String secret;

    @Value("${jwt.issuer:giproject}")
    private String issuer;

    @Value("${jwt.access.expSeconds:1800}")    // 30분
    private long accessExpSeconds;

    @Value("${jwt.refresh.expSeconds:604800}") // 7일
    private long refreshExpSeconds;

    // ✅ SecretKey 생성은 하나만
    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // =========================
    // 임시/프리필 토큰 (소셜 첫가입 컨텍스트)
    // =========================

    /** 프리필 전용 짧은 토큰 생성 (예: 5분 = 300초) */
    public String createTempToken(Map<String, Object> claims, long expiresInSeconds) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expiresInSeconds)))
                .claims(claims)
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    /** 프리필 전용 토큰 파싱/검증 → Claim Map 반환 */
    public Map<String, Object> parseTempToken(String token) {
        Jws<Claims> jws = Jwts.parser()
                .requireIssuer(issuer)
                .verifyWith(key())
                .build()
                .parseSignedClaims(token);
        return jws.getPayload();
    }
    
    public String createAccessToken(Map<String, Object> claims) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessExpSeconds)))
                .claims(claims)
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    public Claims parseSignupToken(String token) {
        // 이미 있는 parseToken()이 있다면 그대로 재사용해도 됩니다.
        return parseToken(token);
    }
    
    public String createRefreshToken(Map<String, Object> claims) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(refreshExpSeconds)))
                .claims(claims)
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    // =========================
    // 액세스 / 리프레시 토큰
    // =========================

    public String generateAccessToken(String username) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + accessExpSeconds * 1000);
        return Jwts.builder()
                .subject(username)
                .issuer(issuer)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    public String generateRefreshToken(String username) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + refreshExpSeconds * 1000);
        return Jwts.builder()
                .subject(username)
                .issuer(issuer)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    public long getRefreshExpSeconds() {
        return refreshExpSeconds;
    }

    // =========================
    // 공용 파서 & 유틸
    // =========================

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validate(String token) {
        try {
            Jwts.parser().verifyWith(key()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsername(String token) {
        return Jwts.parser().verifyWith(key()).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public Authentication toAuthentication(String token, UserDetailsService uds) {
        var user = uds.loadUserByUsername(getUsername(token));
        return new UsernamePasswordAuthenticationToken(user, token, user.getAuthorities());
    }

    public long getAccessExpiresInSeconds() {
        return accessExpSeconds;
    }
}
