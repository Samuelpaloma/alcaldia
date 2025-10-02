package com.example.demo.auth.service;

public interface PasswordResetService {
    void sendResetToken(String email);
    void resetPassword(String token, String newPassword);
    void cleanupExpiredTokens();
}
