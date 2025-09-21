package com.example.demo.categoria.service;

import com.example.demo.categoria.dto.request.CategoriaRequestDTO;
import com.example.demo.categoria.dto.response.CategoriaResponseDTO;
import com.example.demo.categoria.dto.response.CategoriaSimpleDTO;
import com.example.demo.shared.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoriaService {
    
    
    /**
     * Crear nueva categoría
     */
    CategoriaResponseDTO crearCategoria(CategoriaRequestDTO request);
    
    /**
     * Obtener categoría por ID
     */
    CategoriaResponseDTO obtenerCategoriaPorId(Long id);
    
    /**
     * Actualizar categoría
     */
    CategoriaResponseDTO actualizarCategoria(Long id, CategoriaRequestDTO request);
    
    /**
     * Eliminar categoría (soft delete)
     */
    void eliminarCategoria(Long id);
    
    /**
     * Activar/Desactivar categoría
     */
    CategoriaResponseDTO toggleEstadoCategoria(Long id);
    
    // ========== CONSULTAS ==========
    
    /**
     * Obtener todas las categorías activas (para selects)
     */
    List<CategoriaSimpleDTO> obtenerCategoriasActivas();
    
    /**
     * Obtener todas las categorías con paginación
     */
    PageResponse<CategoriaResponseDTO> obtenerTodasLasCategorias(Pageable pageable, Boolean activa, String nombre);
    
    /**
     * Buscar categorías por nombre
     */
    List<CategoriaSimpleDTO> buscarCategoriasPorNombre(String nombre);
    
    // ========== VALIDACIONES ==========
    
    /**
     * Verificar si existe categoría por nombre
     */
    boolean existeCategoriaPorNombre(String nombre);
    
    /**
     * Verificar si existe categoría por nombre (excluyendo ID)
     */
    boolean existeCategoriaPorNombreExcluyendoId(String nombre, Long id);
    
    // ========== ESTADÍSTICAS ==========
    
    /**
     * Obtener total de categorías activas
     */
    long contarCategoriasActivas();
    
    /**
     * Obtener total de categorías
     */
    long contarTotalCategorias();
}


