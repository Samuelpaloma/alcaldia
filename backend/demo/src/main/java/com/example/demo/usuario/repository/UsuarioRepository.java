package com.example.demo.usuario.repository;

import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.model.Usuario;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.example.demo.usuario.dto.response.UsuarioSummaryDTO;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // 🔍 Consultas básicas
    Optional<Usuario> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    boolean existsByUserType(TipoUsuario userType);
    
    List<Usuario> findByUserType(TipoUsuario userType);
    
    List<Usuario> findByUserTypeAndActive(TipoUsuario userType, Boolean active);
    
    // 📊 Consultas para conteos
    long countByUserType(TipoUsuario userType);
    
    long countByUserTypeAndActive(TipoUsuario userType, Boolean active);
    
    // 👥 Consultas de auditoría (quién creó a quién)
    @Query("SELECT u FROM Usuario u WHERE u.createdBy.id = :creadorId")
    List<Usuario> findUsuariosCreatedBy(@Param("creadorId") Long creadorId);
    
    @Query("SELECT u FROM Usuario u WHERE u.userType = :tipo AND u.createdBy.id = :creadorId")
    List<Usuario> findByTipoAndCreador(@Param("tipo") TipoUsuario tipo, @Param("creadorId") Long creadorId);
    
    // 🔧 Consultas específicas para técnicos
    @Query("SELECT u FROM Usuario u WHERE u.userType = 'TECNICO' AND u.active = true " +
           "ORDER BY (SELECT COUNT(t) FROM Ticket t WHERE t.assignedTechnician = u " +
           "AND t.status NOT IN ('RESUELTO', 'CERRADO')) ASC")
    Optional<Usuario> findTechnicianWithLeastActiveTickets();
    
    @Query("SELECT u FROM Usuario u WHERE u.userType = 'TECNICO' AND u.active = true " +
           "AND (SELECT COUNT(t) FROM Ticket t WHERE t.assignedTechnician = u " +
           "AND t.status NOT IN ('RESUELTO', 'CERRADO')) = " +
           "(SELECT MIN((SELECT COUNT(t2) FROM Ticket t2 WHERE t2.assignedTechnician = u2 " +
           "AND t2.status NOT IN ('RESUELTO', 'CERRADO'))) FROM Usuario u2 WHERE u2.userType = 'TECNICO' AND u2.active = true)")
    List<Usuario> findTechniciansWithLeastActiveTickets();
    
    @Query("SELECT u FROM Usuario u WHERE u.userType = 'TECNICO' AND u.active = true")
    List<Usuario> findActiveTechnicians();
    
    // 📋 Consultas paginadas
    Page<Usuario> findByUserType(TipoUsuario userType, Pageable pageable);
    
    Page<Usuario> findByUserTypeAndActive(TipoUsuario userType, Boolean active, Pageable pageable);
    
    @Query("SELECT u FROM Usuario u WHERE u.userType = :tipo " +
           "AND (:search IS NULL OR u.firstName LIKE %:search% OR u.lastName LIKE %:search% OR u.email LIKE %:search%) " +
           "ORDER BY u.createdAt DESC")
    Page<Usuario> findByTipoUsuarioWithSearch(@Param("tipo") TipoUsuario tipo, 
                                            @Param("search") String search, 
                                            Pageable pageable);
    
    // 📈 Consultas para métricas
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.lastAccess >= :since")
    long countActiveUsersSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT u FROM Usuario u WHERE u.lastAccess IS NULL OR u.lastAccess < :before")
    List<Usuario> findInactiveUsersSince(@Param("before") LocalDateTime before);
    
    // 🔐 Consultas de seguridad
    @Query("SELECT u FROM Usuario u WHERE u.userType = 'ADMINISTRADOR' AND u.active = true")
    List<Usuario> findActiveAdmins();
    
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.userType = 'ADMINISTRADOR' AND u.active = true")
    long countActiveAdmins();
    
    // 🎯 Consultas para selects/combos
    @Query("SELECT new com.example.demo.usuario.dto.response.UsuarioSummaryDTO(" +
           "u.id, CONCAT(u.firstName, ' ', u.lastName), u.email, u.userType, u.active, u.lastAccess, " +
           "CONCAT(u.firstName, ' ', u.lastName, ' (', u.email, ')'), CAST(u.id AS string)) " +
           "FROM Usuario u WHERE u.userType = :tipo AND u.active = true " +
           "ORDER BY u.firstName, u.lastName")
    List<UsuarioSummaryDTO> findSummaryByTipo(@Param("tipo") TipoUsuario tipo);
}
