package com.example.demo.usuario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.usuario.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> { // Cambié Long por Integer
    User findByEmailAndPassword(String email, String password);
}