package com.example.demo.usuario.service;

import com.example.demo.auth.service.EmailService;
import com.example.demo.usuario.dto.request.*;
import com.example.demo.usuario.dto.response.*;
import com.example.demo.usuario.exception.*;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.example.demo.shared.dto.PageResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UsuarioServiceImpl implements UsuarioService {
    
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final UsuarioMapper usuarioMapper;
    
    // Constantes de negocio
    private static final int MAX_TECHNICIANS = 50;
    private static final int MAX_ADMINS = 10;
    
    @Override
    public UsuarioDTO createTechnician(CreateTecnicoRequest request, Long adminId) {
        log.info("Admin {} creando técnico: {}", adminId, request.getEmail());
        
        // 1. Validar que quien crea sea admin
        Usuario admin = validateAdmin(adminId);
        
        // 2. Validar reglas de negocio
        validateTechnicianCreation(request);
        
        // 3. Crear técnico
        Usuario tecnico = Usuario.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getNombre())
            .lastName(request.getApellido())
            .userType(TipoUsuario.TECNICO)
            .createdBy(admin)
            .temporaryPassword(true) // Marcar como contraseña temporal
            .require2fa(request.getRequire2fa())
            .build();
        
        Usuario savedTecnico = usuarioRepository.save(tecnico);
        
        // 4. Enviar email de bienvenida
        try {
            emailService.sendWelcomeEmailToTechnician(savedTecnico, request.getPassword());
        } catch (Exception e) {
            log.error("Error enviando email de bienvenida a técnico: {}", savedTecnico.getEmail(), e);
        }
        
        log.info("Técnico creado exitosamente: {} por admin: {}", savedTecnico.getEmail(), admin.getEmail());
        return usuarioMapper.toDTO(savedTecnico);
    }
    
    @Override
    public UsuarioDTO createAdmin(CreateAdminRequest request, Long superAdminId) {
        log.info("SuperAdmin {} creando admin: {}", superAdminId, request.getEmail());
        
        // 1. Validar que quien crea sea superadmin
        Usuario superAdmin = validateSuperAdmin(superAdminId);
        
        // 2. Validar reglas de negocio
        validateAdminCreation(request);
        
        // 3. Crear admin
        Usuario admin = Usuario.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getNombre())
            .lastName(request.getApellido())
            .userType(TipoUsuario.ADMINISTRADOR)
            .createdBy(superAdmin)
            .temporaryPassword(true) // Marcar como contraseña temporal
            .require2fa(request.getRequire2fa())
            .build();
        
        Usuario savedAdmin = usuarioRepository.save(admin);
        
        // 4. Enviar email de bienvenida
        try {
            emailService.sendWelcomeEmailToAdmin(savedAdmin, request.getPassword());
        } catch (Exception e) {
            log.error("Error enviando email de bienvenida a admin: {}", savedAdmin.getEmail(), e);
        }
        
        log.info("Admin creado exitosamente: {} por superadmin: {}", savedAdmin.getEmail(), superAdmin.getEmail());
        return usuarioMapper.toDTO(savedAdmin);
    }
    
    @Override
    @Transactional(readOnly = true)
    public PageResponse<UsuarioDTO> getTechnicians(Pageable pageable, String search) {
        // Mapear fechaCreacion a createdAt para compatibilidad con el frontend
        Pageable mappedPageable = mapSortFields(pageable);
        
        Page<Usuario> page = usuarioRepository.findByTipoUsuarioWithSearch(
            TipoUsuario.TECNICO, search, mappedPageable
        );
        
        List<UsuarioDTO> content = page.getContent().stream()
            .map(usuarioMapper::toDTO)
            .collect(Collectors.toList());
        
        return PageResponse.<UsuarioDTO>of(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isFirst(), page.isLast());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PageResponse<UsuarioDTO> getAdmins(Pageable pageable, String search) {
        // Mapear fechaCreacion a createdAt para compatibilidad con el frontend
        Pageable mappedPageable = mapSortFields(pageable);
        
        Page<Usuario> page = usuarioRepository.findByTipoUsuarioWithSearch(
            TipoUsuario.ADMINISTRADOR, search, mappedPageable
        );
        
        List<UsuarioDTO> content = page.getContent().stream()
            .map(usuarioMapper::toDTO)
            .collect(Collectors.toList());
        
        return PageResponse.<UsuarioDTO>of(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isFirst(), page.isLast());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UsuarioSummaryDTO> getActiveTechniciansForSelect() {
        return usuarioRepository.findSummaryByTipo(TipoUsuario.TECNICO);
    }
    
    // ========== GESTIÓN DE FUNCIONARIOS ==========
    
    @Override
    @Transactional
    public UsuarioDTO createFuncionario(CreateFuncionarioRequest request, Long adminId) {
        log.info("Admin {} creando funcionario: {}", adminId, request.getEmail());
        
        // Validar que el admin existe
        Usuario admin = validateAdmin(adminId);
        
        // Verificar que el email no existe
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        
        // Crear funcionario
        Usuario funcionario = Usuario.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getNombre())
            .lastName(request.getApellido())
            .location(request.getUbicacion())
            .department(request.getDepartamento())
            .position(request.getCargo())
            .userType(TipoUsuario.FUNCIONARIO)
            .active(true)
            .emailVerified(true) // Creados por admin ya verificados
            .temporaryPassword(true) // Debe cambiar contraseña en primer acceso
            .require2fa(request.getRequire2fa())
            .createdBy(admin)
            .build();
        
        Usuario savedFuncionario = usuarioRepository.save(funcionario);
        log.info("Funcionario creado exitosamente: {} por admin: {}", 
                 savedFuncionario.getEmail(), admin.getEmail());
        return usuarioMapper.toDTO(savedFuncionario);
    }
    
    @Override
    @Transactional(readOnly = true)
    public PageResponse<UsuarioDTO> getFuncionarios(Pageable pageable, String search) {
        // Mapear fechaCreacion a createdAt para compatibilidad con el frontend
        Pageable mappedPageable = mapSortFields(pageable);
        
        Page<Usuario> page = usuarioRepository.findByTipoUsuarioWithSearch(
            TipoUsuario.FUNCIONARIO, search, mappedPageable
        );
        
        List<UsuarioDTO> content = page.getContent().stream()
            .map(usuarioMapper::toDTO)
            .collect(Collectors.toList());
        
        return PageResponse.<UsuarioDTO>of(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isFirst(), page.isLast());
    }
    
    @Override
    public UsuarioDTO updateUser(Long userId, UpdateUsuarioRequest request, Long currentUserId) {
        log.info("Usuario {} actualizando datos de usuario {}", currentUserId, userId);
        
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
        
        Usuario currentUser = usuarioRepository.findById(currentUserId)
            .orElseThrow(() -> new UserNotFoundException("Usuario actual no encontrado"));
        
        // Validar permisos
        validateUpdatePermissions(usuario, currentUser);
        
        // Aplicar cambios solo si los campos vienen en la petición
        if (request.getNombre() != null) {
            usuario.setFirstName(request.getNombre());
        }
        if (request.getApellido() != null) {
            usuario.setLastName(request.getApellido());
        }
        
        // Actualizar campos de perfil personal
        if (request.getUbicacion() != null) {
            usuario.setLocation(request.getUbicacion());
        }
        if (request.getDepartamento() != null) {
            usuario.setDepartment(request.getDepartamento());
        }
        if (request.getCargo() != null) {
            usuario.setPosition(request.getCargo());
        }
        
        if (request.getRequire2fa() != null) {
            usuario.setRequire2fa(request.getRequire2fa());
        }
        
        // Solo admin/superadmin pueden cambiar estado activo
        if (request.getActivo() != null && canManageUserStatus(currentUser, usuario)) {
            usuario.setActive(request.getActivo());
        }
        
        Usuario updatedUser = usuarioRepository.save(usuario);
        log.info("Usuario {} actualizado exitosamente", updatedUser.getEmail());
        
        return usuarioMapper.toDTO(updatedUser);
    }
    
    @Override
    public void toggleUserStatus(Long userId, Long currentUserId) {
        log.info("Usuario {} cambiando estado de usuario {}", currentUserId, userId);
        
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
        
        Usuario currentUser = usuarioRepository.findById(currentUserId)
            .orElseThrow(() -> new UserNotFoundException("Usuario actual no encontrado"));
        
        // Validaciones de negocio
        validateStatusToggle(usuario, currentUser);
        
        // Cambiar estado
        usuario.setActive(!usuario.getActive());
        usuarioRepository.save(usuario);
        
        log.info("Estado de usuario {} cambiado a: {}", usuario.getEmail(), usuario.getActive());
    }
    
    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {
        log.info("Cambio de contraseña para usuario: {}", userId);
        
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
        
        // Validar contraseña actual
        if (!passwordEncoder.matches(request.getCurrentPassword(), usuario.getPassword())) {
            throw new BusinessRuleException("La contraseña actual es incorrecta");
        }
        
        // Actualizar contraseña
        usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usuarioRepository.save(usuario);
        
        // Enviar confirmación por email
        try {
            emailService.sendPasswordChangedConfirmation(usuario);
        } catch (Exception e) {
            log.error("Error enviando confirmación de cambio de contraseña", e);
        }
        
        log.info("Contraseña actualizada para usuario: {}", usuario.getEmail());
    }
    
    @Override
    @Transactional(readOnly = true)
    public UsuarioDTO getUserById(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
        
        return usuarioMapper.toDTO(usuario);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UsuarioDTO getUserProfile(Long userId) {
        return getUserById(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UsuarioDTO> getUsersCreatedBy(Long creatorId) {
        List<Usuario> usuarios = usuarioRepository.findUsuariosCreatedBy(creatorId);
        return usuarios.stream()
            .map(usuarioMapper::toDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getTotalUsersByType(TipoUsuario tipo) {
        return usuarioRepository.countByUserType(tipo);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getActiveUsersByType(TipoUsuario tipo) {
        return usuarioRepository.countByUserTypeAndActive(tipo, true);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UsuarioDTO> getInactiveUsers(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        List<Usuario> inactiveUsers = usuarioRepository.findInactiveUsersSince(cutoffDate);
        
        return inactiveUsers.stream()
            .map(usuarioMapper::toDTO)
            .collect(Collectors.toList());
    }
    
    // ========== MÉTODOS PRIVADOS DE VALIDACIÓN ==========
    
    private Usuario validateAdmin(Long adminId) {
        Usuario admin = usuarioRepository.findById(adminId)
            .orElseThrow(() -> new UserNotFoundException("Administrador no encontrado"));
        
        if (!admin.isAdmin()) {
            throw new InsufficientPermissionException("Solo administradores pueden crear técnicos");
        }
        
        if (!admin.getActive()) {
            throw new BusinessRuleException("Administrador desactivado no puede crear usuarios");
        }
        
        return admin;
    }
    
    private Usuario validateSuperAdmin(Long superAdminId) {
        Usuario superAdmin = usuarioRepository.findById(superAdminId)
            .orElseThrow(() -> new UserNotFoundException("Super Administrador no encontrado"));
        
        if (!superAdmin.isSuperAdmin()) {
            throw new InsufficientPermissionException("Solo super administradores pueden crear administradores");
        }
        
        if (!superAdmin.getActive()) {
            throw new BusinessRuleException("Super Administrador desactivado no puede crear usuarios");
        }
        
        return superAdmin;
    }
    
    private void validateTechnicianCreation(CreateTecnicoRequest request) {
        // Validar email único
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleException("Ya existe un usuario con este email");
        }
        
        // Validar límite de técnicos
        long totalTechnicians = usuarioRepository.countByUserType(TipoUsuario.TECNICO);
        if (totalTechnicians >= MAX_TECHNICIANS) {
            throw new BusinessRuleException("Se ha alcanzado el límite máximo de técnicos (" + MAX_TECHNICIANS + ")");
        }
    }
    
    private void validateAdminCreation(CreateAdminRequest request) {
        // Validar email único
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleException("Ya existe un usuario con este email");
        }
        
        // Validar límite de admins
        long totalAdmins = usuarioRepository.countByUserType(TipoUsuario.ADMINISTRADOR);
        if (totalAdmins >= MAX_ADMINS) {
            throw new BusinessRuleException("Se ha alcanzado el límite máximo de administradores (" + MAX_ADMINS + ")");
        }
    }
    
    private void validateUpdatePermissions(Usuario targetUser, Usuario currentUser) {
        // Un usuario puede editar su propio perfil
        if (targetUser.getId().equals(currentUser.getId())) {
            return;
        }
        
        // Admin puede editar técnicos que él creó
        if (currentUser.isAdmin() && targetUser.isTecnico() && 
            targetUser.getCreatedBy() != null && 
            targetUser.getCreatedBy().getId().equals(currentUser.getId())) {
            return;
        }
        
        // SuperAdmin puede editar admins que él creó
        if (currentUser.isSuperAdmin() && targetUser.isAdmin() && 
            targetUser.getCreatedBy() != null && 
            targetUser.getCreatedBy().getId().equals(currentUser.getId())) {
            return;
        }
        
        throw new InsufficientPermissionException("No tienes permisos para editar este usuario");
    }
    
    private void validateStatusToggle(Usuario targetUser, Usuario currentUser) {
        // No puede desactivarse a sí mismo
        if (targetUser.getId().equals(currentUser.getId())) {
            throw new BusinessRuleException("No puedes desactivar tu propia cuenta");
        }
        
        // No se puede desactivar al último admin activo
        if (targetUser.isAdmin() && targetUser.getActive()) {
            long activeAdmins = usuarioRepository.countActiveAdmins();
            if (activeAdmins <= 1) {
                throw new BusinessRuleException("No se puede desactivar al último administrador activo");
            }
        }
        
        // Validar permisos según jerarquía
        if (!canManageUserStatus(currentUser, targetUser)) {
            throw new InsufficientPermissionException("No tienes permisos para cambiar el estado de este usuario");
        }
    }
    
    private boolean canManageUserStatus(Usuario manager, Usuario target) {
        // SuperAdmin puede gestionar admins
        if (manager.isSuperAdmin() && target.isAdmin()) {
            return true;
        }
        
        // Admin puede gestionar técnicos
        if (manager.isAdmin() && target.isTecnico()) {
            return true;
        }
        
        // SuperAdmin puede gestionar cualquiera
        if (manager.isSuperAdmin()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Mapea los campos de ordenamiento del frontend a los campos del modelo
     */
    private Pageable mapSortFields(Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            return pageable;
        }
        
        List<Sort.Order> mappedOrders = pageable.getSort().stream()
            .map(order -> {
                String property = order.getProperty();
                // Mapear fechaCreacion a createdAt
                if ("fechaCreacion".equals(property)) {
                    property = "createdAt";
                }
                return new Sort.Order(order.getDirection(), property);
            })
            .collect(Collectors.toList());
        
        return PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            Sort.by(mappedOrders)
        );
    }
}
