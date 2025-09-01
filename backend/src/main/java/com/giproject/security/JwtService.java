package com.giproject.security;

import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.dto.member.MemberDTO;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.stream.Collectors;

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

    // ✅ SecretKey는 공용 메서드 하나로
    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // =========================
    // 소셜 첫가입/프리필용 임시 토큰
    // =========================

    /** 프리필 전용 짧은 토큰 생성 (예: 300초) */
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

    /** 프리필 전용 토큰 파싱 → Claim Map 반환 */
    public Map<String, Object> parseTempToken(String token) {
        Jws<Claims> jws = Jwts.parser()
                .requireIssuer(issuer)
                .verifyWith(key())
                .build()
                .parseSignedClaims(token);
        return jws.getPayload();
    }

    // =========================
    // 액세스 / 리프레시 토큰 (Claim 직접 주입 버전)
    // =========================

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

    /** (필요 시) 가입용 토큰 파서 별칭 */
    public Claims parseSignupToken(String token) {
        return parseToken(token);
    }

    // =========================
    // 액세스 / 리프레시 토큰 (Authentication 기반)
    // =========================

    /** Authentication 기반 액세스 토큰 생성 (email + roles 포함) */
    public String generateAccessToken(Authentication authentication) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + accessExpSeconds * 1000);

        Object principal = authentication.getPrincipal();
        String email = "";

        if (principal instanceof MemberDTO) {
            email = ((MemberDTO) principal).getMemEmail();
        } else if (principal instanceof CargoOwnerDTO) {
            email = ((CargoOwnerDTO) principal).getCargoEmail();
        }

        return Jwts.builder()
                .subject(authentication.getName()) // sub
                .claim("email", email)              // ✅ 이메일 Claim 포함
                .claim("roles", authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList()))
                .issuer(issuer)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    /** Authentication 기반 리프레시 토큰 생성 (민감 Claim 최소화) */
    public String generateRefreshToken(Authentication authentication) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + refreshExpSeconds * 1000);

        return Jwts.builder()
                .subject(authentication.getName())
                .issuer(issuer)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    public long getRefreshExpSeconds() {
        return refreshExpSeconds;
    }

    public long getAccessExpiresInSeconds() {
        return accessExpSeconds;
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
}
