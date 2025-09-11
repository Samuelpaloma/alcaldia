package com.example.demo.usuario.controller;

import com.example.demo.usuario.DTO.LoginRequestDTO;
import com.example.demo.usuario.DTO.LoginResponseDTO;
import com.example.demo.usuario.model.User;
import com.example.demo.usuario.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:8081")
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

    // LOGIN PARA MÓVIL (Solo Técnicos)
    @PostMapping("/mobile/login")
    public ResponseEntity<LoginResponseDTO> mobileLogin(@RequestBody LoginRequestDTO loginRequest) {
        
        if (!isValidCredentials(loginRequest)) {
            return ResponseEntity.badRequest()
                .body(new LoginResponseDTO(false, "Credenciales inválidas", null, null));
        }

        LoginResponseDTO response = userService.authenticateForMobile(loginRequest);
        
        return response.isSuccess() ? 
            ResponseEntity.ok(response) : 
            new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }
    
    private boolean isValidCredentials(LoginRequestDTO request) {
        String email = request.getEmail();
        String password = request.getPassword();
        
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$") &&
               password != null && password.matches("^\\d{1,10}$");
    }
}
