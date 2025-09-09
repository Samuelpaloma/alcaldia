package com.example.demo.security;

import com.example.demo.usuario.model.Usuario;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class JwtTokenProvider {
    
    @Value("${jwt.secret:miSecretoSuperSeguroParaJWT2025_EstoDebeSerMuyLargoYSeguro}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}") // 24 horas por defecto
    private long jwtExpirationInMs;
    
    private SecretKey getSigningKey() {
    byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
    return Keys.hmacShaKeyFor(keyBytes);
    }
    
    /**
     * Genera token JWT para un usuario
     */
    public String generateToken(Usuario usuario) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", usuario.getIdUsuario());
        claims.put("email", usuario.getEmail());
        claims.put("nombre", usuario.getNombre());
        claims.put("apellido", usuario.getApellido());
        claims.put("tipoUsuario", usuario.getTipoUsuario().name());
        claims.put("activo", usuario.getActivo());
        
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(usuario.getIdUsuario().toString()) // Subject = ID del usuario
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }
    
    /**
     * Genera token para autenticación (usado en login)
     */
    public String generateToken(Authentication authentication) {
        CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();
        return generateToken(userPrincipal.getUsuario());
    }
    
    /**
     * Obtiene el ID del usuario desde el token
     */
    public Long getUserIdFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
        
        return Long.parseLong(claims.getSubject());
    }
    
    /**
     * Obtiene el email desde el token
     */
    public String getEmailFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
        
        return claims.get("email", String.class);
    }
    
    /**
     * Obtiene el tipo de usuario desde el token
     */
    public String getTipoUsuarioFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
        
        return claims.get("tipoUsuario", String.class);
    }
    
    /**
     * Obtiene todas las claims del token
     */
    public Claims getClaimsFromJWT(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
    
    /**
     * Valida el token JWT
     */
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(authToken);
            return true;
        } catch (SecurityException ex) {
            log.error("Firma JWT inválida");
        } catch (MalformedJwtException ex) {
            log.error("Token JWT malformado");
        } catch (ExpiredJwtException ex) {
            log.error("Token JWT expirado");
        } catch (UnsupportedJwtException ex) {
            log.error("Token JWT no soportado");
        } catch (IllegalArgumentException ex) {
            log.error("Claims JWT vacío");
        }
        return false;
    }
    
    /**
     * Obtiene la validez del token en segundos
     */
    public long getTokenValidityInSeconds() {
        return jwtExpirationInMs / 1000;
    }
    
    /**
     * Verifica si el token está expirado
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = getClaimsFromJWT(token);
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
    
    /**
     * Obtiene el tiempo restante del token en milisegundos
     */
    public long getTokenRemainingTime(String token) {
        try {
            Claims claims = getClaimsFromJWT(token);
            Date expiration = claims.getExpiration();
            Date now = new Date();
            return Math.max(0, expiration.getTime() - now.getTime());
        } catch (Exception e) {
            return 0;
        }
    }
}