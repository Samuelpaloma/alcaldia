package com.example.demo.usuario.repository;

import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.model.NivelTecnico;

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
    
    boolean existsByTipoUsuario(TipoUsuario tipoUsuario);
    
    List<Usuario> findByTipoUsuario(TipoUsuario tipoUsuario);
    
    List<Usuario> findByTipoUsuarioAndActivo(TipoUsuario tipoUsuario, Boolean activo);
    
    // 📊 Consultas para conteos
    long countByTipoUsuario(TipoUsuario tipoUsuario);
    
    long countByTipoUsuarioAndActivo(TipoUsuario tipoUsuario, Boolean activo);
    
    // 👥 Consultas de auditoría (quién creó a quién)
    @Query("SELECT u FROM Usuario u WHERE u.creadoPor.idUsuario = :creadorId")
    List<Usuario> findUsuariosCreatedBy(@Param("creadorId") Long creadorId);
    
    @Query("SELECT u FROM Usuario u WHERE u.tipoUsuario = :tipo AND u.creadoPor.idUsuario = :creadorId")
    List<Usuario> findByTipoAndCreador(@Param("tipo") TipoUsuario tipo, @Param("creadorId") Long creadorId);
    
    // 🔧 Consultas específicas para técnicos
    @Query("SELECT u FROM Usuario u WHERE u.tipoUsuario = 'TECNICO' AND u.activo = true " +
           "ORDER BY (SELECT COUNT(t) FROM Ticket t WHERE t.tecnicoAsignado = u " +
           "AND t.estado NOT IN ('RESUELTO', 'CERRADO')) ASC")
    Optional<Usuario> findTechnicianWithLeastActiveTickets();
    
    @Query("SELECT u FROM Usuario u WHERE u.tipoUsuario = 'TECNICO' AND u.activo = true")
    List<Usuario> findActiveTechnicians();
    
    // 📋 Consultas paginadas
    Page<Usuario> findByTipoUsuario(TipoUsuario tipoUsuario, Pageable pageable);
    
    Page<Usuario> findByTipoUsuarioAndActivo(TipoUsuario tipoUsuario, Boolean activo, Pageable pageable);
    
    @Query("SELECT u FROM Usuario u WHERE u.tipoUsuario = :tipo " +
           "AND (:search IS NULL OR u.nombre LIKE %:search% OR u.apellido LIKE %:search% OR u.email LIKE %:search%)")
    Page<Usuario> findByTipoUsuarioWithSearch(@Param("tipo") TipoUsuario tipo, 
                                            @Param("search") String search, 
                                            Pageable pageable);
    
    // 📈 Consultas para métricas
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.ultimoAcceso >= :since")
    long countActiveUsersSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT u FROM Usuario u WHERE u.ultimoAcceso IS NULL OR u.ultimoAcceso < :before")
    List<Usuario> findInactiveUsersSince(@Param("before") LocalDateTime before);
    
    // 🔐 Consultas de seguridad
    @Query("SELECT u FROM Usuario u WHERE u.tipoUsuario = 'ADMINISTRADOR' AND u.activo = true")
    List<Usuario> findActiveAdmins();
    
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.tipoUsuario = 'ADMINISTRADOR' AND u.activo = true")
    long countActiveAdmins();
    
    // 🎯 Consultas para selects/combos
    @Query("SELECT new com.example.demo.usuario.dto.response.UsuarioSummaryDTO(" +
           "u.idUsuario, CONCAT(u.nombre, ' ', u.apellido), u.email, u.tipoUsuario, u.activo, u.ultimoAcceso, " +
           "CONCAT(u.nombre, ' ', u.apellido, ' (', u.email, ')'), CAST(u.idUsuario AS string)) " +
           "FROM Usuario u WHERE u.tipoUsuario = :tipo AND u.activo = true " +
           "ORDER BY u.nombre, u.apellido")
    List<UsuarioSummaryDTO> findSummaryByTipo(@Param("tipo") TipoUsuario tipo);
    
    // 🔧 Consultas para escalamiento
    @Query("SELECT u FROM Usuario u WHERE u.tipoUsuario = :tipoUsuario AND u.nivelTecnico = :nivelTecnico AND u.activo = true")
    List<Usuario> findByTipoUsuarioAndNivelTecnicoAndActivoTrue(@Param("tipoUsuario") TipoUsuario tipoUsuario, @Param("nivelTecnico") NivelTecnico nivelTecnico);
}