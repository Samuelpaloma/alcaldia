package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtRequestFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String path = request.getRequestURI();
        boolean isWebSocketPath = path.startsWith("/ws");
        
        // Solo loggear rutas no-WebSocket para evitar spam
        if (!isWebSocketPath) {
            log.info("🔍 JwtRequestFilter procesando ruta: {}", path);
        }
        
        try {
            String jwt = getJwtFromRequest(request);
            
            // Solo loggear JWT para rutas no-WebSocket
            if (!isWebSocketPath) {
                log.info("🔑 JWT extraído: {}", jwt != null ? "Sí" : "No");
                if (jwt != null) {
                    log.info("🔑 JWT (primeros 20 chars): {}", jwt.substring(0, Math.min(20, jwt.length())));
                }
            }
            
            if (StringUtils.hasText(jwt)) {
                if (!isWebSocketPath) {
                    log.info("🔑 Validando JWT...");
                }
                if (jwtTokenProvider.validateToken(jwt)) {
                    if (!isWebSocketPath) {
                        log.info("✅ JWT válido, obteniendo usuario...");
                    }
                    Long userId = jwtTokenProvider.getUserIdFromJWT(jwt);
                    if (!isWebSocketPath) {
                        log.info("🔑 User ID extraído: {}", userId);
                    }
                    
                    UserDetails userDetails = userDetailsService.loadUserById(userId);
                    
                    if (userDetails != null) {
                        if (!isWebSocketPath) {
                            log.info("✅ Usuario encontrado: {}", userDetails.getUsername());
                        }
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        
                        if (!isWebSocketPath) {
                            log.info("✅ Usuario autenticado: {} con roles: {}", 
                                    userDetails.getUsername(), userDetails.getAuthorities());
                        }
                    } else {
                        log.warn("⚠️ Usuario no encontrado para ID: {}", userId);
                    }
                } else {
                    if (!isWebSocketPath) {
                        log.warn("⚠️ JWT inválido o expirado");
                    }
                }
            } else {
                if (!isWebSocketPath) {
                    log.info("ℹ️ No hay JWT en la petición a: {}", path);
                }
            }
        } catch (Exception ex) {
            log.error("❌ Error estableciendo autenticación: ", ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String path = request.getRequestURI();
        boolean isWebSocketPath = path.startsWith("/ws");
        
        // Buscar en el header Authorization
        String bearerToken = request.getHeader("Authorization");
        if (!isWebSocketPath) {
            log.info("🔍 Header Authorization: {}", bearerToken != null ? "Presente" : "Ausente");
        }
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (!isWebSocketPath) {
                log.info("🔑 Token extraído del header Authorization");
            }
            return token;
        }
        
        // Buscar en el header X-Authorization (fallback)
        String xAuthToken = request.getHeader("X-Authorization");
        if (!isWebSocketPath) {
            log.info("🔍 Header X-Authorization: {}", xAuthToken != null ? "Presente" : "Ausente");
        }
        
        if (StringUtils.hasText(xAuthToken) && xAuthToken.startsWith("Bearer ")) {
            String token = xAuthToken.substring(7);
            if (!isWebSocketPath) {
                log.info("🔑 Token extraído del header X-Authorization");
            }
            return token;
        }
        
        // Buscar en query parameter (fallback)
        String queryToken = request.getParameter("token");
        if (!isWebSocketPath) {
            log.info("🔍 Query parameter token: {}", queryToken != null ? "Presente" : "Ausente");
        }
        
        if (StringUtils.hasText(queryToken)) {
            if (!isWebSocketPath) {
                log.info("🔑 Token extraído del query parameter");
            }
            return queryToken;
        }
        
        if (!isWebSocketPath) {
            log.info("ℹ️ No se encontró token en ningún lugar");
        }
        return null;
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        // No filtrar NINGUNA ruta de autenticación
        boolean isAuthPath = path.startsWith("/api/auth/");
        
        // No filtrar rutas públicas
        boolean isPublicPath = path.startsWith("/swagger-ui/") ||
                              path.startsWith("/v3/api-docs/") ||
                              path.startsWith("/actuator/health") ||
                              path.equals("/favicon.ico") ||
                              path.equals("/api/superadmin/check-superadmin");
        
        // No filtrar rutas de WebSocket
        boolean isWebSocketPath = path.startsWith("/ws");
        
        boolean shouldNotFilter = isAuthPath || isPublicPath || isWebSocketPath;
        
        // Solo loggear para rutas no-WebSocket para evitar spam
        if (!isWebSocketPath) {
            log.info("🔍 JwtRequestFilter - Ruta: {} - Es auth: {} - Es pública: {} - Es WebSocket: {} - NO FILTRAR: {}", 
                     path, isAuthPath, isPublicPath, isWebSocketPath, shouldNotFilter);
        }
        
        return shouldNotFilter;
    }
}
