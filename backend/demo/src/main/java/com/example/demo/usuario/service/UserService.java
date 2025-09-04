package com.example.demo.usuario.service;

import com.example.demo.usuario.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.usuario.model.User;


@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User login(String email, String password) {
        return userRepository.findByEmailAndPassword(email, password);
    }
}
