package com.example.demo.auth.repository;

import com.example.demo.auth.model.PasswordResetToken;
import com.example.demo.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    // Buscar token válido por código
    Optional<PasswordResetToken> findByTokenAndUsadoFalseAndFechaExpiracionAfter(
        String token, LocalDateTime now
    );
    
    // Buscar tokens por usuario (para invalidar anteriores)
    @Query("SELECT p FROM PasswordResetToken p WHERE p.usuario = :usuario AND p.usado = false")
    Optional<PasswordResetToken> findActiveTokenByUsuario(@Param("usuario") Usuario usuario);
    
    // Invalidar tokens anteriores del usuario
    @Modifying
    @Query("UPDATE PasswordResetToken p SET p.usado = true WHERE p.usuario = :usuario AND p.usado = false")
    void invalidateAllTokensByUsuario(@Param("usuario") Usuario usuario);
    
    // Limpiar tokens expirados (para tarea programada)
    @Modifying
    @Query("DELETE FROM PasswordResetToken p WHERE p.fechaExpiracion < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    // Verificar si existe token válido
    boolean existsByTokenAndUsadoFalseAndFechaExpiracionAfter(String token, LocalDateTime now);
}