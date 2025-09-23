package com.example.demo.security;

import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.model.User;
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
    
    private User usuario;
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convertir TipoUsuario a rol de Spring Security
        String roleName = "ROLE_" + usuario.getTipoUsuario().name();
        return Collections.singletonList(new SimpleGrantedAuthority(roleName));
    }
    
    @Override
    public String getPassword() {
        return usuario.getPassword();
    }
    
    @Override
    public String getUsername() {
        // Spring Security usa username, pero nosotros usamos email
        return String.valueOf(usuario.getId()); // Retornamos ID como string
    }
    
    public String getEmail() {
        return usuario.getEmail();
    }
    
    public Integer getUserId() {
        return usuario.getId();
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
    public User getUsuario() {
        return usuario;
    }
}