package com.example.demo.auth.service;

import com.example.demo.auth.dto.request.LoginRequest;
import com.example.demo.auth.dto.request.RegisterRequest;
import com.example.demo.auth.dto.response.LoginResponse;

public interface AuthService {
    LoginResponse authenticate(LoginRequest request);
    void validateCredentials(LoginRequest request);
    void registerFuncionario(RegisterRequest request);
    void logout(String token);
}