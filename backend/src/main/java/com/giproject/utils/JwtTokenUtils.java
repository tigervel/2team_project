package com.giproject.utils;

import com.giproject.security.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.InvalidClaimException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.io.UnsupportedEncodingException;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 통합된 JWT 유틸리티 클래스
 * 
 * 기능:
 * - JWT 토큰 생성 (기존 JWTUtil 기능 통합)
 * - JWT 토큰 검증
 * - JWT 토큰에서 사용자 정보 추출 (authorId, roles)
 * - 권한 검증 (Admin, 작성자 본인 확인)
 * 
 * QABoard, NoticeBoard 등에서 권한 검증에 사용
 */
@Component
@Log4j2
public class JwtTokenUtils {

    private static final String SECRET_KEY = "123456789012345678901234567890817682825";

    @Autowired
    private JwtService jwtService;

    // ==================== 토큰 생성 기능 (기존 JWTUtil 통합) ====================

    /**
     * JWT 토큰 생성 (기존 JWTUtil.generateToken 메서드 통합)
     * 
     * @param valueMap 토큰에 포함할 클레임 정보
     * @param minutes 유효 시간(분)
     * @return 생성된 JWT 토큰
     */
    public static String generateToken(Map<String, Object> valueMap, int minutes) {
        SecretKey key = null;
        
        try {
            key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes("UTF-8")); 
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
        
        String jwtStr = Jwts.builder()
                .setHeader(Map.of("typ", "JWT"))
                .setClaims(valueMap)
                .setIssuedAt(Date.from(ZonedDateTime.now().toInstant()))
                .setExpiration(Date.from(ZonedDateTime.now().plusMinutes(minutes).toInstant()))
                .signWith(key)
                .compact();
        
        return jwtStr;
    }

    /**
     * JWT 토큰 검증 (기존 JWTUtil.validateToken 메서드 통합)
     * 
     * @param token 검증할 JWT 토큰
     * @return 토큰의 클레임 정보
     * @throws CustomJWTExeption 토큰 검증 실패시
     */
    public static Map<String, Object> validateToken(String token) {
        Map<String, Object> claim = null;
        
        try {
            SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes("UTF-8"));
            
            claim = Jwts.parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (MalformedJwtException e) {
            throw new CustomJWTExeption("Malformed");
        } catch (WeakKeyException e) {
            throw new CustomJWTExeption("WeakKey");
        } catch (UnsupportedEncodingException e) {
            throw new CustomJWTExeption("UnsupportedEncoding");
        } catch (ExpiredJwtException expiredJwtException) {
            throw new CustomJWTExeption("Expired");
        } catch (InvalidClaimException claimException) {
            throw new CustomJWTExeption("InvalidClaim");
        } catch (JwtException e) {
            throw new CustomJWTExeption("Jwt");
        } catch (Exception e) {
            throw new CustomJWTExeption("Error");
        }
        
        return claim;
    }

    // ==================== 토큰 정보 추출 및 권한 검증 기능 ====================

    /**
     * HTTP 요청에서 JWT 토큰을 추출
     * 
     * @param request HTTP 요청 객체
     * @return JWT 토큰 문자열, 없으면 null
     */
    public String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        log.debug("Authorization 헤더 확인: {}", authHeader != null ? "존재함" : "없음");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring("Bearer ".length()).trim();
            log.debug("JWT 토큰 추출 성공: {}자 길이", token.length());
            return token;
        }
        
        log.debug("JWT 토큰을 찾을 수 없습니다. Authorization 헤더: {}", authHeader);
        return null;
    }

    /**
     * JWT 토큰에서 Claims 정보 추출
     * 
     * @param token JWT 토큰
     * @return Claims 객체, 유효하지 않으면 null
     */
    public Claims getClaimsFromToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                log.warn("JWT 토큰이 비어있습니다.");
                return null;
            }
            
            Claims claims = jwtService.parseToken(token);
            log.debug("JWT 토큰 파싱 성공 - subject: {}", claims.getSubject());
            return claims;
        } catch (Exception e) {
            log.warn("JWT 토큰 파싱 실패: {} - 토큰: {}...", e.getMessage(), 
                    token != null && token.length() > 10 ? token.substring(0, 10) : "null");
            return null;
        }
    }

    /**
     * JWT 토큰에서 사용자 ID (sub) 추출
     * 
     * @param token JWT 토큰
     * @return 사용자 ID (authorId), 추출 실패시 null
     */
    public String getAuthorIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims != null ? claims.getSubject() : null;
    }

    /**
     * HTTP 요청에서 사용자 ID 추출
     * 
     * @param request HTTP 요청 객체
     * @return 사용자 ID, 추출 실패시 null
     */
    public String getAuthorIdFromRequest(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        return token != null ? getAuthorIdFromToken(token) : null;
    }

    /**
     * JWT 토큰에서 권한(roles) 정보 추출
     * 
     * @param token JWT 토큰
     * @return 권한 목록, 추출 실패시 빈 리스트
     */
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        if (claims != null && claims.get("roles") instanceof List) {
            return (List<String>) claims.get("roles");
        }
        return List.of();
    }

    /**
     * HTTP 요청에서 권한 정보 추출
     * 
     * @param request HTTP 요청 객체
     * @return 권한 목록, 추출 실패시 빈 리스트
     */
    public List<String> getRolesFromRequest(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        return token != null ? getRolesFromToken(token) : List.of();
    }

    /**
     * Admin 권한 여부 확인
     * 
     * @param token JWT 토큰
     * @return Admin 권한 여부
     */
    public boolean isAdminFromToken(String token) {
        List<String> roles = getRolesFromToken(token);
        return roles.stream().anyMatch(role -> 
            role.equalsIgnoreCase("ROLE_ADMIN") || 
            role.equalsIgnoreCase("ADMIN") ||
            role.toLowerCase().contains("admin")
        );
    }

    /**
     * HTTP 요청에서 Admin 권한 여부 확인
     * 
     * @param request HTTP 요청 객체
     * @return Admin 권한 여부
     */
    public boolean isAdminFromRequest(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        return token != null ? isAdminFromToken(token) : false;
    }

    /**
     * 작성자 본인 여부 확인
     * 
     * @param token JWT 토큰
     * @param targetAuthorId 대상 작성자 ID
     * @return 본인 여부
     */
    public boolean isAuthorFromToken(String token, String targetAuthorId) {
        String authorId = getAuthorIdFromToken(token);
        return authorId != null && authorId.equals(targetAuthorId);
    }

    /**
     * HTTP 요청에서 작성자 본인 여부 확인
     * 
     * @param request HTTP 요청 객체
     * @param targetAuthorId 대상 작성자 ID
     * @return 본인 여부
     */
    public boolean isAuthorFromRequest(HttpServletRequest request, String targetAuthorId) {
        String token = extractTokenFromRequest(request);
        return token != null ? isAuthorFromToken(token, targetAuthorId) : false;
    }

    /**
     * 권한 검증: Admin이거나 작성자 본인인지 확인
     * 
     * @param token JWT 토큰
     * @param targetAuthorId 대상 작성자 ID
     * @return 권한 있음 여부
     */
    public boolean hasPermissionFromToken(String token, String targetAuthorId) {
        return isAdminFromToken(token) || isAuthorFromToken(token, targetAuthorId);
    }

    /**
     * HTTP 요청에서 권한 검증: Admin이거나 작성자 본인인지 확인
     * 
     * @param request HTTP 요청 객체
     * @param targetAuthorId 대상 작성자 ID
     * @return 권한 있음 여부
     */
    public boolean hasPermissionFromRequest(HttpServletRequest request, String targetAuthorId) {
        String token = extractTokenFromRequest(request);
        return token != null ? hasPermissionFromToken(token, targetAuthorId) : false;
    }

    /**
     * JWT 토큰 유효성 검증
     * 
     * @param token JWT 토큰
     * @return 유효성 여부
     */
    public boolean isValidToken(String token) {
        return jwtService.validate(token);
    }

    /**
     * HTTP 요청에서 JWT 토큰 유효성 검증
     * 
     * @param request HTTP 요청 객체
     * @return 유효성 여부
     */
    public boolean isValidTokenFromRequest(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        return token != null && isValidToken(token);
    }

    /**
     * 사용자 정보 객체 생성 (편의 메서드)
     */
    public static class UserInfo {
        private final String authorId;
        private final List<String> roles;
        private final boolean isAdmin;

        public UserInfo(String authorId, List<String> roles, boolean isAdmin) {
            this.authorId = authorId;
            this.roles = roles;
            this.isAdmin = isAdmin;
        }

        public String getAuthorId() { return authorId; }
        public List<String> getRoles() { return roles; }
        public boolean isAdmin() { return isAdmin; }
        public boolean hasPermission(String targetAuthorId) {
            return isAdmin || (authorId != null && authorId.equals(targetAuthorId));
        }
    }

    /**
     * JWT 토큰에서 사용자 정보 객체 추출
     * 
     * @param token JWT 토큰
     * @return 사용자 정보 객체, 추출 실패시 null
     */
    public UserInfo getUserInfoFromToken(String token) {
        String authorId = getAuthorIdFromToken(token);
        if (authorId != null) {
            List<String> roles = getRolesFromToken(token);
            boolean isAdmin = isAdminFromToken(token);
            return new UserInfo(authorId, roles, isAdmin);
        }
        return null;
    }

    /**
     * HTTP 요청에서 사용자 정보 객체 추출
     * 
     * @param request HTTP 요청 객체
     * @return 사용자 정보 객체, 추출 실패시 null
     */
    public UserInfo getUserInfoFromRequest(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        return token != null ? getUserInfoFromToken(token) : null;
    }
}