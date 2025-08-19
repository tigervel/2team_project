package com.giproject.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    private static final AntPathMatcher MATCHER = new AntPathMatcher();

    // 필터에서 제외할 공개/정적 경로
    private static final List<String> EXCLUDES = List.of(
            "/favicon.ico",
            "/error",
            "/",
            "/h2-console/**",
            "/uploads/**",
            "/g2i4/**",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/signup",
            "/api/signup/check-id",
            "/api/email/**",
            "/api/qaboard/**",
            "/oauth2/authorization/**",
            "/login/oauth2/**",
            // 스프링 정적 리소스 위치
            "/css/**", "/js/**", "/images/**", "/webjars/**",
            "/**/*.css", "/**/*.js", "/**/*.png", "/**/*.jpg", "/**/*.jpeg", "/**/*.gif", "/**/*.svg", "/**/*.ico"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        for (String pat : EXCLUDES) {
            if (MATCHER.match(pat, uri)) return true;
        }
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // 토큰이 없으면 건너뜀 (공개 경로는 인가 규칙에서 허용됨)
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            if (jwtService.validate(token)) {
                var auth = jwtService.toAuthentication(token, userDetailsService);
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                // 유효하지 않은 토큰: 인증 미설정 상태로 통과 (보호된 API는 시큐리티에서 401 처리)
                log.debug("Invalid JWT token");
            }
        } catch (Exception ex) {
            // 여기서 절대 예외 터뜨리지 말 것 — 정적 리소스 요청에서 500을 막음
            log.debug("JWT parse error: {}", ex.getMessage());
        }

        chain.doFilter(request, response);
    }
}