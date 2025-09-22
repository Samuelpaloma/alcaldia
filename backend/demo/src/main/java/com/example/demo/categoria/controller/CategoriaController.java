package com.example.demo.categoria.controller;

import com.example.demo.categoria.dto.request.CategoriaRequestDTO;
import com.example.demo.categoria.dto.response.CategoriaResponseDTO;
import com.example.demo.categoria.dto.response.CategoriaSimpleDTO;
import com.example.demo.categoria.service.CategoriaService;
import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CategoriaController {
    
    private final CategoriaService categoriaService;
    
    // ========== ENDPOINTS PÚBLICOS (Para selects) ==========
    
    /**
     * Obtener categorías activas para selects
     * GET /api/categorias/activas
     */
    @GetMapping("/activas")
    public ResponseEntity<List<CategoriaSimpleDTO>> obtenerCategoriasActivas() {
        log.info("Solicitando categorías activas");
        List<CategoriaSimpleDTO> categorias = categoriaService.obtenerCategoriasActivas();
        return ResponseEntity.ok(categorias);
    }
    
    /**
     * Buscar categorías por nombre
     * GET /api/categorias/buscar?nombre=...
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<CategoriaSimpleDTO>> buscarCategoriasPorNombre(
            @RequestParam String nombre) {
        log.info("Buscando categorías por nombre: {}", nombre);
        List<CategoriaSimpleDTO> categorias = categoriaService.buscarCategoriasPorNombre(nombre);
        return ResponseEntity.ok(categorias);
    }
    
    // ========== ENDPOINTS DE ADMINISTRACIÓN ==========
    
    /**
     * Crear nueva categoría
     * POST /api/categorias
     */
    @PostMapping
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> crearCategoria(@Valid @RequestBody CategoriaRequestDTO request) {
        try {
            log.info("Creando categoría: {}", request.getNombre());
            CategoriaResponseDTO categoria = categoriaService.crearCategoria(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(categoria);
        } catch (Exception e) {
            log.error("Error creando categoría", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al crear la categoría: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener categoría por ID
     * GET /api/categorias/{id}
     */
    @GetMapping("/{id}")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerCategoriaPorId(@PathVariable Long id) {
        try {
            log.info("Obteniendo categoría ID: {}", id);
            CategoriaResponseDTO categoria = categoriaService.obtenerCategoriaPorId(id);
            return ResponseEntity.ok(categoria);
        } catch (Exception e) {
            log.error("Error obteniendo categoría ID: {}", id, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener la categoría: " + e.getMessage())
            );
        }
    }
    
    /**
     * Actualizar categoría
     * PUT /api/categorias/{id}
     */
    @PutMapping("/{id}")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> actualizarCategoria(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequestDTO request) {
        try {
            log.info("Actualizando categoría ID: {}", id);
            CategoriaResponseDTO categoria = categoriaService.actualizarCategoria(id, request);
            return ResponseEntity.ok(categoria);
        } catch (Exception e) {
            log.error("Error actualizando categoría ID: {}", id, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al actualizar la categoría: " + e.getMessage())
            );
        }
    }
    
    /**
     * Eliminar categoría (soft delete)
     * DELETE /api/categorias/{id}
     */
    @DeleteMapping("/{id}")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> eliminarCategoria(@PathVariable Long id) {
        try {
            log.info("Eliminando categoría ID: {}", id);
            categoriaService.eliminarCategoria(id);
            return ResponseEntity.ok(ApiResponse.success("Categoría eliminada exitosamente"));
        } catch (Exception e) {
            log.error("Error eliminando categoría ID: {}", id, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al eliminar la categoría: " + e.getMessage())
            );
        }
    }
    
    /**
     * Activar/Desactivar categoría
     * PATCH /api/categorias/{id}/toggle
     */
    @PatchMapping("/{id}/toggle")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> toggleEstadoCategoria(@PathVariable Long id) {
        try {
            log.info("Cambiando estado de categoría ID: {}", id);
            CategoriaResponseDTO categoria = categoriaService.toggleEstadoCategoria(id);
            return ResponseEntity.ok(categoria);
        } catch (Exception e) {
            log.error("Error cambiando estado de categoría ID: {}", id, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al cambiar el estado de la categoría: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener todas las categorías con paginación y filtros
     * GET /api/categorias?page=0&size=10&activa=true&nombre=...
     */
    @GetMapping
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<PageResponse<CategoriaResponseDTO>> obtenerTodasLasCategorias(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orden") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) Boolean activa,
            @RequestParam(required = false) String nombre) {
        
        log.info("Obteniendo categorías - página: {}, tamaño: {}, activa: {}, nombre: {}", 
                page, size, activa, nombre);
        
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) 
            ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        PageResponse<CategoriaResponseDTO> categorias = categoriaService
            .obtenerTodasLasCategorias(pageable, activa, nombre);
        
        return ResponseEntity.ok(categorias);
    }
    
    // ========== ENDPOINTS DE ESTADÍSTICAS ==========
    
    /**
     * Obtener estadísticas de categorías
     * GET /api/categorias/estadisticas
     */
    @GetMapping("/estadisticas")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            log.info("Obteniendo estadísticas de categorías");
            
            long totalCategorias = categoriaService.contarTotalCategorias();
            long categoriasActivas = categoriaService.contarCategoriasActivas();
            long categoriasInactivas = totalCategorias - categoriasActivas;
            
            return ResponseEntity.ok(new EstadisticasCategoriasDTO(
                totalCategorias, 
                categoriasActivas, 
                categoriasInactivas
            ));
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas de categorías", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener las estadísticas: " + e.getMessage())
            );
        }
    }
    
    // ========== CLASE INTERNA PARA ESTADÍSTICAS ==========
    
    public static class EstadisticasCategoriasDTO {
        public final long totalCategorias;
        public final long categoriasActivas;
        public final long categoriasInactivas;
        
        public EstadisticasCategoriasDTO(long totalCategorias, long categoriasActivas, long categoriasInactivas) {
            this.totalCategorias = totalCategorias;
            this.categoriasActivas = categoriasActivas;
            this.categoriasInactivas = categoriasInactivas;
        }
    }
}
