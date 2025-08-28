package com.giproject.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
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
import com.giproject.security.JwtService;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;

    public SecurityConfig(UserDetailsService userDetailsService,
                          CustomOAuth2SuccessHandler customOAuth2SuccessHandler) {
        this.userDetailsService = userDetailsService;
        this.customOAuth2SuccessHandler = customOAuth2SuccessHandler;
    }

    // ✅ JwtAuthenticationFilter를 Bean으로 등록
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService,
                                                           UserDetailsService userDetailsService) {
        return new JwtAuthenticationFilter(jwtService, userDetailsService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthenticationFilter jwtAuthenticationFilter,
                                           AuthenticationProvider authenticationProvider) throws Exception {
    	// 핵심만 발췌
    	http
    	  .cors(c -> c.configurationSource(corsConfigurationSource()))
    	  .csrf(AbstractHttpConfigurer::disable)
    	  .headers(h -> h.frameOptions(f -> f.sameOrigin()))
    	  .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
    	  .formLogin(AbstractHttpConfigurer::disable)
    	  .requestCache(rc -> rc.disable())
    	  .exceptionHandling(e -> e
    	      .authenticationEntryPoint((req, res, ex) -> res.sendError(401))
    	      .accessDeniedHandler((req, res, ex) -> res.sendError(403))
    	  )
    	  .oauth2Login(o -> o
    	      .authorizationEndpoint(a -> a.baseUri("/oauth2/authorization"))
    	      .redirectionEndpoint(r -> r.baseUri("/login/oauth2/code/*"))
    	      .successHandler(customOAuth2SuccessHandler)
    	      .failureHandler((req, res, ex) -> {
    	          String base = req.getHeader("Origin");
    	          if (base == null || base.isBlank()) base = frontendBaseUrl;
    	          String msg = ex.getMessage() == null ? "oauth2_failed" : ex.getMessage();
    	          String target = base + "/login?error=" +
    	                  java.net.URLEncoder.encode(msg, java.nio.charset.StandardCharsets.UTF_8);
    	          res.sendRedirect(target);
    	      })
    	  )
    	  .authorizeHttpRequests(auth -> auth
    	      .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

    	      // 정적/SPA 루트
    	      .requestMatchers("/", "/index.html", "/error", "/favicon.ico",
    	                       "/assets/**", "/static/**").permitAll()
    	      .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()

    	      // OAuth 흐름
    	      .requestMatchers("/oauth2/**", "/login/**").permitAll()

    	      // ✅ 공개 API
    	      .requestMatchers("/api/auth/**").permitAll()    // 회원가입/로그인/리프레시 등
    	      .requestMatchers("/api/email/**").permitAll()   // ✅ 이메일 인증 전용 (여기 추가)

    	      .requestMatchers("/uploads/**", "/h2-console/**").permitAll()

    	      // 나머지는 인증 필요
    	      .anyRequest().authenticated()
    	  )
    	  .authenticationProvider(authenticationProvider)
    	  .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    public AuthenticationProvider authenticationProvider(PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(encoder);
        return provider;
    }

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

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
    @Value("${frontend.base-url}")
    private String frontendBaseUrl;
}
