package com.example.demo.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    @Override
    public void commence(HttpServletRequest request, 
                        HttpServletResponse response,
                        AuthenticationException authException) throws IOException, ServletException {
        
        String path = request.getServletPath();
        log.debug("Petición sin autenticación: {}", path);
        
        // NUNCA devolver error para rutas de autenticación
        if (path.startsWith("/api/auth/")) {
            log.debug("Ruta de auth detectada, continuando sin error: {}", path);
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        
        // Solo devolver error de autenticación para rutas protegidas
        if (isProtectedPath(path)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            
            Map<String, Object> body = new HashMap<>();
            body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
            body.put("message", "Token de acceso requerido para acceder a este recurso");
            body.put("timestamp", LocalDateTime.now().toString());
            body.put("path", path);
            
            ObjectMapper mapper = new ObjectMapper();
            mapper.writeValue(response.getOutputStream(), body);
        } else {
            // Para rutas públicas, continuar sin error
            response.setStatus(HttpServletResponse.SC_OK);
        }
    }
    
    private boolean isProtectedPath(String path) {
        // Rutas que requieren autenticación (excluyendo rutas públicas de auth)
        return !path.startsWith("/api/auth/") && 
               !path.startsWith("/swagger-ui/") && 
               !path.startsWith("/v3/api-docs/") && 
               !path.startsWith("/actuator/health") &&
               !path.equals("/favicon.ico");
    }
}