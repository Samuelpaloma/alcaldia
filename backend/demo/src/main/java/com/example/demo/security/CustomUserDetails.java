package com.example.demo.security;

import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Data
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {
    
    private Usuario usuario;
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convertir TipoUsuario a rol de Spring Security
        String roleName = "ROLE_" + usuario.getTipoUsuario().name();
        return Collections.singletonList(new SimpleGrantedAuthority(roleName));
    }
    
    @Override
    public String getPassword() {
        return usuario.getPasswordHash();
    }
    
    @Override
    public String getUsername() {
        // Spring Security usa username, pero nosotros usamos email
        return usuario.getIdUsuario().toString(); // Retornamos ID como string
    }
    
    public String getEmail() {
        return usuario.getEmail();
    }
    
    public Long getUserId() {
        return usuario.getIdUsuario();
    }
    
    public TipoUsuario getTipoUsuario() {
        return usuario.getTipoUsuario();
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return usuario.getActivo(); // Cuenta bloqueada si está inactiva
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return usuario.getActivo();
    }
    
    // Método para obtener el usuario completo
    public Usuario getUsuario() {
        return usuario;
    }
}