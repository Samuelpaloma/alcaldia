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
@RequestMapping("/api/usuarios")
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
        
        // Validación de campos vacíos
        if (loginRequest.getEmail() == null || loginRequest.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new LoginResponseDTO(false, "El campo correo es obligatorio", null, null));
        }
        
        if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new LoginResponseDTO(false, "El campo contraseña es obligatorio", null, null));
        }

        // Validación de formato de email
        if (!loginRequest.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            return ResponseEntity.badRequest()
                .body(new LoginResponseDTO(false, "El formato del correo electrónico no es válido", null, null));
        }

        // Validación de formato de contraseña
        if (!loginRequest.getPassword().matches("^\\d{1,10}$")) {
            return ResponseEntity.badRequest()
                .body(new LoginResponseDTO(false, "La contraseña debe contener solo números y máximo 10 dígitos", null, null));
        }

        // Intentar autenticación
        try {
            LoginResponseDTO response = userService.authenticateForMobile(loginRequest);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                // Si el servicio devuelve error, usar el mensaje específico
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            // Error interno del servidor
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new LoginResponseDTO(false, "Error interno del servidor. Inténtelo más tarde.", null, null));
        }
    }

    private boolean isValidCredentials(LoginRequestDTO request) {
        String email = request.getEmail();
        String password = request.getPassword();
        
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$") 
            && password != null && password.matches("^\\d{1,10}$");
    }
}
