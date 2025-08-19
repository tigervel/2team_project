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

    private static final List<String> EXCLUDES = List.of(
        "/favicon.ico", "/error", "/",
        "/h2-console/**", "/uploads/**", "/g2i4/**",
        "/api/auth/login", "/api/auth/refresh", "/api/auth/signup",
        "/api/signup/check-id", "/api/email/**", "/api/qaboard/**",
        "/oauth2/authorization/**", "/login/oauth2/**",
        "/css/**", "/js/**", "/images/**", "/webjars/**",
        "/**/*.css", "/**/*.js", "/**/*.png", "/**/*.jpg", "/**/*.jpeg",
        "/**/*.gif", "/**/*.svg", "/**/*.ico"
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
                log.debug("Invalid JWT token");
            }
        } catch (Exception ex) {
            log.debug("JWT parse error: {}", ex.getMessage());
        }

        chain.doFilter(request, response);
    }
}