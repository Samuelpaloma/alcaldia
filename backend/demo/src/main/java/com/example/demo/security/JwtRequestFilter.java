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
        log.debug("JwtRequestFilter procesando ruta: {}", path);
        
        try {
            String jwt = getJwtFromRequest(request);
            log.info("🔑 JWT extraído: {}", jwt != null ? "Sí" : "No");
            log.info("🔑 JWT completo: {}", jwt);
            
            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
                Long userId = jwtTokenProvider.getUserIdFromJWT(jwt);
                
                UserDetails userDetails = userDetailsService.loadUserById(userId);
                
                if (userDetails != null) {
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    log.debug("Usuario autenticado: {} con roles: {}", 
                            userDetails.getUsername(), userDetails.getAuthorities());
                }
            } else {
                log.debug("No hay JWT válido en la petición a: {}", path);
            }
        } catch (Exception ex) {
            log.error("No se pudo establecer la autenticación del usuario en el contexto de seguridad", ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
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
        
        boolean shouldNotFilter = isAuthPath || isPublicPath;
        
        log.info("🔍 JwtRequestFilter - Ruta: {} - Es auth: {} - Es pública: {} - NO FILTRAR: {}", 
                 path, isAuthPath, isPublicPath, shouldNotFilter);
        
        return shouldNotFilter;
    }
}