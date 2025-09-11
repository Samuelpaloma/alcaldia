package com.example.demo.usuario.service;

import com.example.demo.usuario.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.usuario.DTO.LoginRequestDTO;
import com.example.demo.usuario.DTO.LoginResponseDTO;
import com.example.demo.usuario.model.User;


@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User login(String email, String password) {
        return userRepository.findByEmailAndPassword(email, password);
    }

    // Autenticación para MÓVIL (Solo Técnico)  
    public LoginResponseDTO authenticateForMobile(LoginRequestDTO request) {
        User user = userRepository.findByEmailAndPassword(request.getEmail(), request.getPassword());
        
        if (user == null) {
            return new LoginResponseDTO(false, "Credenciales incorrectas", null, null);
        }
        
        // Verificar que sea TECNICO
        if (!user.getRol().equals("TECNICO")) {
            return new LoginResponseDTO(false, "No tienes permisos para acceder a la aplicación móvil", null, null);
        }
        
        return new LoginResponseDTO(true, "Login exitoso", user, null);
    }

}
