package com.giproject.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    // HS256 기준 최소 32바이트 이상 문자열을 환경설정으로 주입
    @Value("${jwt.secret:CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_256_BITS_MINIMUM_1234567890}")
    private String secret;

    @Value("${jwt.issuer:giproject}")
    private String issuer;

    @Value("${jwt.access.expSeconds:1800}")    // 30분
    private long accessExpSeconds;

    @Value("${jwt.refresh.expSeconds:604800}") // 7일
    private long refreshExpSeconds;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // =========================
    // 신규: 공용 파서/가입토큰 지원
    // =========================

    /** JWT를 파싱해 Claims를 반환 (jjwt 0.12 스타일) */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** 소셜 첫가입 컨텍스트 토큰 파싱 (컨트롤러에서 claims.get("email") 형태로 사용 가능) */
    public Claims parseSignupToken(String token) {
        return parseToken(token);
    }

    /**
     * 소셜 첫가입 컨텍스트 토큰 생성 (기본 만료 10분).
     * - email / provider 클레임 포함
     * - subject는 email로 설정 (원하면 providerUserId 등으로 바꿔도 OK)
     */
    public String generateSignupToken(String email, String provider) {
        long expSeconds = 600L; // 10분
        Date now = new Date();
        Date exp = new Date(now.getTime() + expSeconds * 1000);
        return Jwts.builder()
                .subject(email)
                .issuer(issuer)
                .issuedAt(now)
                .expiration(exp)
                .claim("email", email)
                .claim("provider", provider)
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    // =========================
    // 기존 액세스/리프레시 토큰 로직
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
