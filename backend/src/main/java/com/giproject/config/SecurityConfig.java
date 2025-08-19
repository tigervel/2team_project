// com.giproject.config.SecurityConfig.java
package com.giproject.config;

import java.util.List;

import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.core.userdetails.UserDetailsService;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.giproject.security.JwtAuthenticationFilter;
import com.giproject.security.CustomOAuth2SuccessHandler;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;
    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          UserDetailsService userDetailsService,
                          CustomOAuth2SuccessHandler customOAuth2SuccessHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
        this.customOAuth2SuccessHandler = customOAuth2SuccessHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CORS
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            // CSRF: API 서버면 보통 비활성화
            .csrf(AbstractHttpConfigurer::disable)
            // H2 콘솔 frame 허용
            .headers(h -> h.frameOptions(f -> f.sameOrigin()))
            // 세션 전략 (JWT 사용 시 무상태)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // OAuth2 소셜 로그인: 성공 시 커스텀 핸들러로 리다이렉트 제어
            .oauth2Login(o -> o
                .successHandler(customOAuth2SuccessHandler)   // ✅ 소셜 첫 로그인 → /signup?ticket=...
                .failureUrl("/login?error")
            )
            // 인가 규칙 — anyRequest()는 반드시 맨 마지막!
            .authorizeHttpRequests(auth -> auth
                // CORS preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 토큰/회원가입 공개 엔드포인트
                .requestMatchers("/api/auth/login", "/api/auth/refresh", "/api/auth/signup").permitAll()

                // 공개 API (기존 규칙 유지)
                .requestMatchers("/api/signup/check-id").permitAll()
                .requestMatchers("/api/email/**").permitAll()
                .requestMatchers("/api/test").permitAll()
                .requestMatchers("/api/qaboard/**").permitAll()
                .requestMatchers("/g2i4/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()

                // OAuth2 엔드포인트는 공개
                .requestMatchers("/oauth2/authorization/**", "/login/oauth2/**").permitAll()

                // 정적 리소스 & H2 콘솔
                .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                .requestMatchers("/h2-console/**").permitAll()

                // 나머지는 인증 필요
                .anyRequest().authenticated()
            )
            // DaoAuthenticationProvider 등록(UsernamePasswordAuthenticationToken 처리)
            .authenticationProvider(authenticationProvider(passwordEncoder()))
            // JWT 인증 필터 등록 (UsernamePasswordAuthenticationFilter 앞)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // DaoAuthenticationProvider
    @Bean
    public AuthenticationProvider authenticationProvider(PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService); // CustomUserDetailsService
        provider.setPasswordEncoder(encoder);               // BCryptPasswordEncoder
        return provider;
    }

    // CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3002"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // 비밀번호 인코더
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager (로그인 인증에 필요)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
