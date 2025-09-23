package com.example.demo.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtRequestFilter jwtRequestFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*")); // En producción, especificar dominios
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 🔓 Endpoints públicos de AUTH
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/register").permitAll()
                .requestMatchers("/api/auth/verify-email").permitAll()
                .requestMatchers("/api/auth/resend-verification").permitAll()
                .requestMatchers("/api/auth/validate-credentials").permitAll()
                .requestMatchers("/api/auth/request-login-code").permitAll()
                .requestMatchers("/api/auth/verify-login-code").permitAll()
                .requestMatchers("/api/auth/test-email").permitAll()
                .requestMatchers("/api/auth/test-db").permitAll()
                .requestMatchers("/api/auth/test-verify").permitAll()
                .requestMatchers("/api/auth/verify-email-simple").permitAll()
                .requestMatchers("/api/auth/forgot-password").permitAll()
                .requestMatchers("/api/auth/reset-password").permitAll()
                
                // 📋 Documentación y salud
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/favicon.ico").permitAll()
                
                // 📊 Endpoints de sesiones y actividades (temporalmente públicos)
                .requestMatchers("/api/sessions/**").permitAll()
                .requestMatchers("/api/activities/**").permitAll()
                
                // 🔐 Endpoints específicos por rol
                .requestMatchers("/api/usuarios/admin").hasRole("SUPERADMIN")
                .requestMatchers("/api/usuarios/tecnico").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/usuarios/admins").hasRole("SUPERADMIN")
                .requestMatchers("/api/usuarios/tecnicos").hasAnyRole("ADMINISTRADOR", "SUPERADMIN")
                
                // 🎫 Endpoints de tickets - requieren autenticación
                .requestMatchers("/api/tickets/**").authenticated()
                
                // 👤 Endpoints de perfil de usuario - requieren autenticación
                .requestMatchers("/api/usuarios/profile").authenticated()
                
                // 🔐 Todo lo demás requiere autenticación
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}