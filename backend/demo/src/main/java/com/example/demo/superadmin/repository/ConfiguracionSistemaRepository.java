package com.example.demo.superadmin.repository;

import com.example.demo.superadmin.model.ConfiguracionSistema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConfiguracionSistemaRepository extends JpaRepository<ConfiguracionSistema, Long> {
    
    // Buscar por clave
    Optional<ConfiguracionSistema> findByClave(String clave);
    
    // Verificar si existe por clave
    boolean existsByClave(String clave);
    
    // Buscar por categoría
    List<ConfiguracionSistema> findByCategoriaAndActivaTrue(String categoria);
    
    // Buscar todas las activas
    List<ConfiguracionSistema> findByActivaTrueOrderByCategoriaAsc();
    
    // Buscar por categoría
    List<ConfiguracionSistema> findByCategoria(String categoria);
    
    // Buscar configuraciones de colores
    @Query("SELECT c FROM ConfiguracionSistema c WHERE c.categoria = 'colores' AND c.activa = true ORDER BY c.clave")
    List<ConfiguracionSistema> findColoresActivos();
    
    // Buscar configuraciones de logo
    @Query("SELECT c FROM ConfiguracionSistema c WHERE c.categoria = 'logo' AND c.activa = true ORDER BY c.clave")
    List<ConfiguracionSistema> findLogoActivo();
    
    // Buscar configuraciones generales
    @Query("SELECT c FROM ConfiguracionSistema c WHERE c.categoria = 'general' AND c.activa = true ORDER BY c.clave")
    List<ConfiguracionSistema> findConfiguracionesGenerales();
}
