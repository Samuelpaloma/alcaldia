package com.example.demo.auth.repository;

import com.example.demo.auth.model.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PendingUserRepository extends JpaRepository<PendingUser, Long> {
    
    Optional<PendingUser> findByEmailAndVerificationCodeAndCodeExpirationAfter(
        String email, 
        String verificationCode, 
        LocalDateTime now
    );
    
    // Método alternativo para debugging
    @Query("SELECT p FROM PendingUser p WHERE p.email = :email AND p.verificationCode = :code")
    Optional<PendingUser> findByEmailAndVerificationCode(@Param("email") String email, @Param("code") String code);
    
    // Método para buscar por email y código sin verificar expiración
    @Query("SELECT p FROM PendingUser p WHERE p.email = :email AND p.verificationCode = :code")
    Optional<PendingUser> findByEmailAndCode(@Param("email") String email, @Param("code") String code);
    
    Optional<PendingUser> findByEmailAndVerified(String email, boolean verified);
    
    @Modifying
    @Query("DELETE FROM PendingUser p WHERE p.email = :email")
    void deleteByEmail(@Param("email") String email);
    
    @Modifying
    @Query("DELETE FROM PendingUser p WHERE p.codeExpiration < :now")
    void deleteExpiredPendingUsers(@Param("now") LocalDateTime now);
}
