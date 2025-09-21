package com.example.demo.auth.service;

import com.example.demo.auth.dto.request.ChangeTemporaryPasswordRequest;
import com.example.demo.auth.dto.request.LoginRequest;
import com.example.demo.auth.dto.request.RegisterRequest;
import com.example.demo.auth.dto.request.VerifyEmailRequest;
import com.example.demo.auth.dto.request.ResendVerificationRequest;
import com.example.demo.auth.dto.response.LoginResponse;

public interface AuthService {
    LoginResponse authenticate(LoginRequest request);
    void registerFuncionario(RegisterRequest request);
    void verifyEmail(VerifyEmailRequest request);
    void resendVerificationCode(ResendVerificationRequest request);
    void changeTemporaryPassword(String token, ChangeTemporaryPasswordRequest request);
    void logout(String token);
}