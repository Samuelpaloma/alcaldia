package com.example.demo.auth.repository;

import com.example.demo.auth.model.EmailVerificationToken;
import com.example.demo.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    
    // Buscar token válido por código
    Optional<EmailVerificationToken> findByTokenAndUsadoFalseAndFechaExpiracionAfter(
        String token, LocalDateTime now
    );
    
    // Buscar tokens por usuario (para invalidar anteriores)
    @Query("SELECT e FROM EmailVerificationToken e WHERE e.usuario = :usuario AND e.usado = false")
    Optional<EmailVerificationToken> findActiveTokenByUsuario(@Param("usuario") Usuario usuario);
    
    // Invalidar tokens anteriores del usuario
    @Modifying
    @Query("UPDATE EmailVerificationToken e SET e.usado = true WHERE e.usuario = :usuario AND e.usado = false")
    void invalidateAllTokensByUsuario(@Param("usuario") Usuario usuario);
    
    // Limpiar tokens expirados (para tarea programada)
    @Modifying
    @Query("DELETE FROM EmailVerificationToken e WHERE e.fechaExpiracion < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    // Verificar si existe token válido
    boolean existsByTokenAndUsadoFalseAndFechaExpiracionAfter(String token, LocalDateTime now);
}