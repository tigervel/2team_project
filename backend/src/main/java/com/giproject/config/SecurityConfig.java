package com.giproject.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .oauth2Login(oauth2 -> oauth2.defaultSuccessUrl("/", true).failureUrl("/login?error"))
        .authorizeHttpRequests(auth -> auth
        	// CORS preflight 허용
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            // 아이디 중복 확인 API 허용
            .requestMatchers(HttpMethod.GET, "/api/signup/check-id").permitAll()
            .requestMatchers("/api/email/**").permitAll()
            .requestMatchers("/api/test").permitAll()
            .requestMatchers("/api/qaboard/**").permitAll() // QABoard API 임시 허용 (JWT 구현 전)
            .requestMatchers("/api/notices/**").permitAll() // ✅ Notice API 허용
            .requestMatchers("/h2-console/**").permitAll() // H2 Console 허용 (개발 환경용)
            .requestMatchers("/g2i4/**").permitAll()
            .requestMatchers("/uploads/**").permitAll()
            .anyRequest().authenticated()
        );
        return http.build();
    }

    // CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 정확한 origin 명시 (frontend 포트 추가)
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3002"));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // 쿠키 등 자격정보 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}