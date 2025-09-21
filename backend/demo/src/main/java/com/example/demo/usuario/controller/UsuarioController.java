package com.example.demo.usuario.controller;

import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.shared.dto.PageResponse;
import com.example.demo.usuario.dto.request.*;
import com.example.demo.usuario.dto.response.*;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.service.UsuarioService;
import com.example.demo.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UsuarioController {
    
    private final UsuarioService usuarioService;
    
    // ========== GESTIÓN DE TÉCNICOS (Solo Admin) ==========
    
    @PostMapping("/tecnico")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioDTO> createTechnician(
            @Valid @RequestBody CreateTecnicoRequest request,
            Authentication authentication) {
        
        log.info("Admin creando técnico: {}", request.getEmail());
        Long adminId = getUserIdFromAuth(authentication);
        UsuarioDTO tecnico = usuarioService.createTechnician(request, adminId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(tecnico);
    }
    
    @GetMapping("/tecnicos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<PageResponse<UsuarioDTO>> getTechnicians(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "fechaCreacion") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search) {
        
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) 
            ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        PageResponse<UsuarioDTO> tecnicos = usuarioService.getTechnicians(pageable, search);
        return ResponseEntity.ok(tecnicos);
    }
    
    @GetMapping("/tecnicos/select")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<List<UsuarioSummaryDTO>> getTechniciansForSelect() {
        List<UsuarioSummaryDTO> tecnicos = usuarioService.getActiveTechniciansForSelect();
        return ResponseEntity.ok(tecnicos);
    }
    
    // ========== GESTIÓN DE ADMINS (Solo SuperAdmin) ==========
    
    @PostMapping("/admin")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<UsuarioDTO> createAdmin(
            @Valid @RequestBody CreateAdminRequest request,
            Authentication authentication) {
        
        log.info("SuperAdmin creando admin: {}", request.getEmail());
        Long superAdminId = getUserIdFromAuth(authentication);
        UsuarioDTO admin = usuarioService.createAdmin(request, superAdminId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(admin);
    }
    
    @GetMapping("/admins")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<PageResponse<UsuarioDTO>> getAdmins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "fechaCreacion") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search) {
        
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) 
            ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        PageResponse<UsuarioDTO> admins = usuarioService.getAdmins(pageable, search);
        return ResponseEntity.ok(admins);
    }
    
    // ========== GESTIÓN GENERAL DE USUARIOS ==========
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<UsuarioDTO> getUserById(@PathVariable Long id) {
        UsuarioDTO usuario = usuarioService.getUserById(id);
        return ResponseEntity.ok(usuario);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<UsuarioDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUsuarioRequest request,
            Authentication authentication) {
        
        Long currentUserId = getUserIdFromAuth(authentication);
        UsuarioDTO updatedUser = usuarioService.updateUser(id, request, currentUserId);
        
        return ResponseEntity.ok(updatedUser);
    }
    
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse> toggleUserStatus(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long currentUserId = getUserIdFromAuth(authentication);
        usuarioService.toggleUserStatus(id, currentUserId);
        
        return ResponseEntity.ok(new ApiResponse("Estado de usuario actualizado exitosamente"));
    }
    
    // ========== PERFIL PERSONAL ==========
    
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioDTO> getMyProfile(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        UsuarioDTO profile = usuarioService.getUserProfile(userId);
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioDTO> updateMyProfile(
            @Valid @RequestBody UpdateUsuarioRequest request,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        UsuarioDTO updatedProfile = usuarioService.updateUser(userId, request, userId);
        
        return ResponseEntity.ok(updatedProfile);
    }
    
    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuth(authentication);
        usuarioService.changePassword(userId, request);
        
        return ResponseEntity.ok(new ApiResponse("Contraseña actualizada exitosamente"));
    }
    
    // ========== CONSULTAS DE AUDITORÍA ==========
    
    @GetMapping("/created-by/{creatorId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<List<UsuarioDTO>> getUsersCreatedBy(@PathVariable Long creatorId) {
        List<UsuarioDTO> usuarios = usuarioService.getUsersCreatedBy(creatorId);
        return ResponseEntity.ok(usuarios);
    }
    
    @GetMapping("/my-created-users")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<List<UsuarioDTO>> getMyCreatedUsers(Authentication authentication) {
        Long currentUserId = getUserIdFromAuth(authentication);
        List<UsuarioDTO> usuarios = usuarioService.getUsersCreatedBy(currentUserId);
        return ResponseEntity.ok(usuarios);
    }
    
    // ========== MÉTRICAS ==========
    
    @GetMapping("/metrics/total/{tipo}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<Long> getTotalUsersByType(@PathVariable String tipo) {
        TipoUsuario tipoUsuario = TipoUsuario.valueOf(tipo.toUpperCase());
        long total = usuarioService.getTotalUsersByType(tipoUsuario);
        return ResponseEntity.ok(total);
    }
    
    @GetMapping("/metrics/active/{tipo}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<Long> getActiveUsersByType(@PathVariable String tipo) {
        TipoUsuario tipoUsuario = TipoUsuario.valueOf(tipo.toUpperCase());
        long active = usuarioService.getActiveUsersByType(tipoUsuario);
        return ResponseEntity.ok(active);
    }
    
    @GetMapping("/inactive")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<List<UsuarioDTO>> getInactiveUsers(
            @RequestParam(defaultValue = "30") int days) {
        List<UsuarioDTO> inactiveUsers = usuarioService.getInactiveUsers(days);
        return ResponseEntity.ok(inactiveUsers);
    }
    
    // ========== MÉTODO AUXILIAR ==========
    
    private Long getUserIdFromAuth(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }
        
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        
        // Si es CustomUserDetails, usar el método específico
        if (userDetails instanceof CustomUserDetails) {
            return ((CustomUserDetails) userDetails).getUsuario().getIdUsuario();
        }
        
        // Fallback: intentar parsear el username como ID
        try {
            return Long.parseLong(userDetails.getUsername());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("No se pudo obtener el ID del usuario autenticado");
        }
    }
}