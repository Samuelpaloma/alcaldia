package com.example.demo.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashedPassword = encoder.encode("123456");
        System.out.println("Hash BCrypt para 123456:");
        System.out.println(hashedPassword);
        
        // También puedes generar otros hashes si necesitas
        String hashedPassword2 = encoder.encode("admin123");
        System.out.println("\nHash BCrypt para admin123:");
        System.out.println(hashedPassword2);
    }
}