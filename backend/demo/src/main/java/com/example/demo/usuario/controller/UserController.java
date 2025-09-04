package com.example.demo.usuario.controller;

import com.example.demo.usuario.DTO.LoginRequestDTO;
import com.example.demo.usuario.model.User;
import com.example.demo.usuario.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Object login(@RequestBody LoginRequestDTO loginRequest) {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        // Validación de email
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$") ) {
            return "Email inválido";
        }
        // Validación de contraseña: solo números y máximo 10 caracteres
        if (password == null || !password.matches("^\\d{1,10}$")) {
            return "La contraseña debe ser solo números y máximo 10 dígitos";
        }

        User user = userService.login(email, password);
        if (user == null) {
            return "Credenciales incorrectas";
        }
        return user;
    }
}
