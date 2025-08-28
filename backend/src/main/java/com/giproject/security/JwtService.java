package com.giproject.security;

import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.dto.member.MemberDTO;
import io.jsonwebtoken.Claims;
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
import java.util.Date;
import java.util.stream.Collectors;

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
                .setSubject(authentication.getName())
                .claim("email", email)
                .claim("roles", authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList()))
                .setIssuer(issuer)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    public String generateRefreshToken(Authentication authentication) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + refreshExpSeconds * 1000);

        return Jwts.builder()
                .setSubject(authentication.getName())
                .setIssuer(issuer)
                .setIssuedAt(now)
                .setExpiration(exp)
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
