package com.example.demo.notificacion.repository;

import com.example.demo.notificacion.model.PreferenciasNotificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PreferenciasNotificacionRepository extends JpaRepository<PreferenciasNotificacion, Long> {
    
    /**
     * Buscar preferencias por ID de usuario
     */
    Optional<PreferenciasNotificacion> findByUsuarioId(Long usuarioId);
    
    /**
     * Verificar si existen preferencias para un usuario
     */
    boolean existsByUsuarioId(Long usuarioId);
}