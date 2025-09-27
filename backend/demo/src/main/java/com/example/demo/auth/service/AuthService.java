package com.example.demo.auth.service;

import com.example.demo.auth.dto.request.*;
import com.example.demo.auth.dto.response.LoginResponse;
import com.example.demo.auth.model.PendingUser;

public interface AuthService {
    // Registro
    PendingUser createPendingUser(RegisterRequest request);
    LoginResponse verifyEmailAndCompleteRegistration(VerifyEmailRequest request);
    PendingUser resendVerificationCode(String email);
    
    // Login
    LoginResponse authenticateWithVerification(LoginRequest request);
    void validateCredentials(LoginRequest request);
    PendingUser createLoginVerification(LoginRequest request);
    LoginResponse verifyLoginCode(VerifyEmailRequest request);
    
    // Recuperación de contraseña
    PendingUser createPasswordResetVerification(String email);
    LoginResponse resetPasswordWithCode(ResetPasswordRequest request);
    
    // Utilidades
    void changeTemporaryPassword(String token, ChangeTemporaryPasswordRequest request);
    void changePassword(String token, com.example.demo.usuario.dto.request.ChangePasswordRequest request);
    void logout(String token);
    void verifyToken(String token);
    long getUserCount();
}