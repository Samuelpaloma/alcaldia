package com.example.demo.usuario.service;

import com.example.demo.usuario.dto.request.*;
import com.example.demo.usuario.dto.response.*;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.shared.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UsuarioService {
    
    // 🔧 Gestión de técnicos (Solo Admin)
    UsuarioDTO createTechnician(CreateTecnicoRequest request, Long adminId);
    PageResponse<UsuarioDTO> getTechnicians(Pageable pageable, String search);
    List<UsuarioSummaryDTO> getActiveTechniciansForSelect();
    
    // 👑 Gestión de admins (Solo SuperAdmin)
    UsuarioDTO createAdmin(CreateAdminRequest request, Long superAdminId);
    PageResponse<UsuarioDTO> getAdmins(Pageable pageable, String search);
    
    // 👥 Gestión de funcionarios (Admin puede gestionar)
    UsuarioDTO createFuncionario(CreateFuncionarioRequest request, Long adminId);
    PageResponse<UsuarioDTO> getFuncionarios(Pageable pageable, String search);
    
    // ✏️ Actualización de usuarios
    UsuarioDTO updateUser(Long userId, UpdateUsuarioRequest request, Long currentUserId);
    void toggleUserStatus(Long userId, Long currentUserId);
    void changePassword(Long userId, ChangePasswordRequest request);
    
    // 🔍 Consultas
    UsuarioDTO getUserById(Long userId);
    UsuarioDTO getUserProfile(Long userId);
    List<UsuarioDTO> getUsersCreatedBy(Long creatorId);
    
    // 📊 Métricas
    long getTotalUsersByType(TipoUsuario tipo);
    long getActiveUsersByType(TipoUsuario tipo);
    List<UsuarioDTO> getInactiveUsers(int days);
}