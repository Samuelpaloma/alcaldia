package com.example.demo.security;

import com.example.demo.usuario.model.User;
import com.example.demo.usuario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    
    private final UserRepository usuarioRepository;
    
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // El username puede ser email o ID
        User usuario;
        
        try {
            // Intentar como ID primero
            Integer userId = Integer.parseInt(username);
            usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con ID: " + username));
        } catch (NumberFormatException e) {
            // Si no es un número, buscar por email
            usuario = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + username));
        }
        
        return new CustomUserDetails(usuario);
    }
    
    /**
     * Carga usuario por ID (usado por JWT)
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Integer userId) {
        User usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con ID: " + userId));
        
        return new CustomUserDetails(usuario);
    }
}
