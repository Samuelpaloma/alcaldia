package com.example.demo.shared.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.demo.security.CustomUserDetails;
import com.example.demo.usuario.model.Usuario;

public class SecurityUtils {
    
    /**
     * Obtiene el usuario actual autenticado
     */
    public static Usuario getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            return userDetails.getUsuario();
        }
        return null;
    }
    
    /**
     * Obtiene el ID del usuario actual
     */
    public static Long getCurrentUserId() {
        Usuario user = getCurrentUser();
        return user != null ? user.getIdUsuario() : null;
    }
    
    /**
     * Obtiene el email del usuario actual
     */
    public static String getCurrentUserEmail() {
        Usuario user = getCurrentUser();
        return user != null ? user.getEmail() : null;
    }
    
    /**
     * Verifica si el usuario actual tiene un rol específico
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
        }
        return false;
    }
    
    /**
     * Verifica si hay un usuario autenticado
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() && 
               !(authentication.getPrincipal() instanceof String);
    }
}
