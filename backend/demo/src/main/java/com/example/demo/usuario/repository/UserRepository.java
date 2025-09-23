package com.example.demo.usuario.repository;

import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.model.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.example.demo.usuario.DTO.response.UsuarioSummaryDTO;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // 🔍 Consultas básicas
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByTipoUsuario(TipoUsuario tipoUsuario);

    List<User> findByTipoUsuarioAndActivo(TipoUsuario tipoUsuario, Boolean activo);

    // 📊 Consultas para conteos
    long countByTipoUsuario(TipoUsuario tipoUsuario);

    long countByTipoUsuarioAndActivo(TipoUsuario tipoUsuario, Boolean activo);

    // 👥 Consultas de auditoría
    @Query("SELECT u FROM User u WHERE u.creadoPor.id = :creadorId")
    List<User> findUsuariosCreatedBy(@Param("creadorId") Integer creadorId);

    @Query("SELECT u FROM User u WHERE u.tipoUsuario = :tipo AND u.creadoPor.id = :creadorId")
    List<User> findByTipoAndCreador(@Param("tipo") TipoUsuario tipo, @Param("creadorId") Integer creadorId);

    // 🔧 Consultas específicas para técnicos
    @Query("SELECT u FROM User u WHERE u.tipoUsuario = com.example.demo.usuario.model.TipoUsuario.TECNICO AND u.activo = true " +
           "ORDER BY (SELECT COUNT(t) FROM com.example.demo.ticket.model.Ticket t WHERE t.tecnicoAsignado = u " +
           "AND t.estado NOT IN ('RESUELTO', 'CERRADO')) ASC")
    Optional<User> findTechnicianWithLeastActiveTickets();

    @Query("SELECT u FROM User u WHERE u.tipoUsuario = com.example.demo.usuario.model.TipoUsuario.TECNICO AND u.activo = true")
    List<User> findActiveTechnicians();

    // 📋 Consultas paginadas
    Page<User> findByTipoUsuario(TipoUsuario tipoUsuario, Pageable pageable);

    Page<User> findByTipoUsuarioAndActivo(TipoUsuario tipoUsuario, Boolean activo, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.tipoUsuario = :tipo " +
           "AND (:search IS NULL OR u.nombre LIKE %:search% OR u.apellido LIKE %:search% OR u.email LIKE %:search%)")
    Page<User> findByTipoUsuarioWithSearch(@Param("tipo") TipoUsuario tipo,
                                           @Param("search") String search,
                                           Pageable pageable);

    // 📈 Consultas para métricas
    @Query("SELECT COUNT(u) FROM User u WHERE u.ultimoAcceso >= :since")
    long countActiveUsersSince(@Param("since") LocalDateTime since);

    @Query("SELECT u FROM User u WHERE u.ultimoAcceso IS NULL OR u.ultimoAcceso < :before")
    List<User> findInactiveUsersSince(@Param("before") LocalDateTime before);

    // 🔐 Consultas de seguridad
    @Query("SELECT u FROM User u WHERE u.tipoUsuario = com.example.demo.usuario.model.TipoUsuario.ADMINISTRADOR AND u.activo = true")
    List<User> findActiveAdmins();

    @Query("SELECT COUNT(u) FROM User u WHERE u.tipoUsuario = com.example.demo.usuario.model.TipoUsuario.ADMINISTRADOR AND u.activo = true")
    long countActiveAdmins();

    // 🎯 Consultas para selects/combos
    @Query("SELECT new com.example.demo.usuario.DTO.response.UsuarioSummaryDTO(" +
        "u.id, CONCAT(u.nombre, ' ', u.apellido), u.email, " +
        "u.tipoUsuario, u.activo, u.ultimoAcceso, " +
        "CONCAT(u.nombre, ' ', u.apellido, ' (', u.email, ')'), " +
        "CAST(u.id AS string)) " +
        "FROM User u WHERE u.tipoUsuario = :tipo AND u.activo = true " +
        "ORDER BY u.nombre, u.apellido")
    List<UsuarioSummaryDTO> findSummaryByTipo(@Param("tipo") TipoUsuario tipo);



    User findByEmailAndPassword(String email, String password);
}