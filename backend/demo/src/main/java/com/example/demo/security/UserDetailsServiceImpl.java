package com.example.demo.security;

import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    
    private final UsuarioRepository usuarioRepository;
    
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // El username puede ser email o ID
        Usuario usuario;
        
        try {
            // Intentar como ID primero
            Long userId = Long.parseLong(username);
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
    public UserDetails loadUserById(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con ID: " + userId));
        
        return new CustomUserDetails(usuario);
    }
}
