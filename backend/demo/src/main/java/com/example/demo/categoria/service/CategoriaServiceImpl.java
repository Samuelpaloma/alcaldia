package com.example.demo.categoria.service;

import com.example.demo.categoria.dto.request.CategoriaRequestDTO;
import com.example.demo.categoria.dto.response.CategoriaResponseDTO;
import com.example.demo.categoria.dto.response.CategoriaSimpleDTO;
import com.example.demo.categoria.model.Categoria;
import com.example.demo.categoria.repository.CategoriaRepository;
import com.example.demo.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CategoriaServiceImpl implements CategoriaService {
    
    private final CategoriaRepository categoriaRepository;
    
    @Override
    public CategoriaResponseDTO crearCategoria(CategoriaRequestDTO request) {
        log.info("Creando nueva categoría: {}", request.getNombre());
        
        // 1. Validar que no exista otra categoría con el mismo nombre
        if (categoriaRepository.existsByNameIgnoreCaseAndIdNot(request.getNombre(), 0L)) {
            throw new RuntimeException("Ya existe una categoría con el nombre: " + request.getNombre());
        }
        
        // 2. Crear categoría
        Categoria categoria = Categoria.builder()
            .name(request.getNombre().trim())
            .description(request.getDescripcion() != null ? request.getDescripcion().trim() : null)
            .colorHex(request.getColorHex())
            .icon(request.getIcono())
            .order(request.getOrden() != null ? request.getOrden() : 999)
            .active(request.getActiva() != null ? request.getActiva() : true)
            .build();
        
        Categoria savedCategoria = categoriaRepository.save(categoria);
        
        log.info("Categoría creada exitosamente: {} (ID: {})", savedCategoria.getName(), savedCategoria.getId());
        
        return convertirACategoriaResponseDTO(savedCategoria);
    }
    
    @Override
    @Transactional(readOnly = true)
    public CategoriaResponseDTO obtenerCategoriaPorId(Long id) {
        log.info("Obteniendo categoría por ID: {}", id);
        
        Categoria categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
        
        return convertirACategoriaResponseDTO(categoria);
    }
    
    @Override
    public CategoriaResponseDTO actualizarCategoria(Long id, CategoriaRequestDTO request) {
        log.info("Actualizando categoría ID: {} con nombre: {}", id, request.getNombre());
        
        // 1. Buscar categoría existente
        Categoria categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
        
        // 2. Validar que no exista otra categoría con el mismo nombre
        if (categoriaRepository.existsByNameIgnoreCaseAndIdNot(request.getNombre(), id)) {
            throw new RuntimeException("Ya existe otra categoría con el nombre: " + request.getNombre());
        }
        
        // 3. Actualizar campos
        categoria.setName(request.getNombre().trim());
        categoria.setDescription(request.getDescripcion() != null ? request.getDescripcion().trim() : null);
        categoria.setColorHex(request.getColorHex());
        categoria.setIcon(request.getIcono());
        categoria.setOrder(request.getOrden() != null ? request.getOrden() : categoria.getOrder());
        categoria.setActive(request.getActiva() != null ? request.getActiva() : categoria.getActive());
        
        Categoria updatedCategoria = categoriaRepository.save(categoria);
        
        log.info("Categoría actualizada exitosamente: {} (ID: {})", updatedCategoria.getName(), updatedCategoria.getId());
        
        return convertirACategoriaResponseDTO(updatedCategoria);
    }
    
    @Override
    public void eliminarCategoria(Long id) {
        log.info("Eliminando categoría ID: {}", id);
        
        Categoria categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
        
        // Soft delete - desactivar en lugar de eliminar
        categoria.setActive(false);
        categoriaRepository.save(categoria);
        
        log.info("Categoría desactivada exitosamente: {} (ID: {})", categoria.getName(), categoria.getId());
    }
    
    @Override
    public CategoriaResponseDTO toggleEstadoCategoria(Long id) {
        log.info("Cambiando estado de categoría ID: {}", id);
        
        Categoria categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
        
        categoria.setActive(!categoria.getActive());
        Categoria updatedCategoria = categoriaRepository.save(categoria);
        
        log.info("Estado de categoría {} cambiado a: {}", updatedCategoria.getName(), updatedCategoria.getActive() ? "ACTIVA" : "INACTIVA");
        
        return convertirACategoriaResponseDTO(updatedCategoria);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CategoriaSimpleDTO> obtenerCategoriasActivas() {
        log.info("Obteniendo categorías activas");
        
        List<Categoria> categorias = categoriaRepository.findByActiveTrueOrderByOrderAsc();
        
        return categorias.stream()
            .map(this::convertirACategoriaSimpleDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PageResponse<CategoriaResponseDTO> obtenerTodasLasCategorias(Pageable pageable, Boolean activa, String nombre) {
        log.info("Obteniendo categorías con filtros - activa: {}, nombre: {}", activa, nombre);
        
        Page<Categoria> categoriasPage = categoriaRepository.findWithFilters(activa, nombre, pageable);
        
        List<CategoriaResponseDTO> categoriasDTO = categoriasPage.getContent().stream()
            .map(this::convertirACategoriaResponseDTO)
            .collect(Collectors.toList());
        
        return PageResponse.<CategoriaResponseDTO>builder()
            .content(categoriasDTO)
            .page(categoriasPage.getNumber())
            .size(categoriasPage.getSize())
            .totalElements(categoriasPage.getTotalElements())
            .totalPages(categoriasPage.getTotalPages())
            .first(categoriasPage.isFirst())
            .last(categoriasPage.isLast())
            .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CategoriaSimpleDTO> buscarCategoriasPorNombre(String nombre) {
        log.info("Buscando categorías por nombre: {}", nombre);
        
        List<Categoria> categorias = categoriaRepository.findActivasByNombreContainingIgnoreCase(nombre);
        
        return categorias.stream()
            .map(this::convertirACategoriaSimpleDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existeCategoriaPorNombre(String nombre) {
        return categoriaRepository.existsByNameIgnoreCaseAndIdNot(nombre, 0L);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existeCategoriaPorNombreExcluyendoId(String nombre, Long id) {
        return categoriaRepository.existsByNameIgnoreCaseAndIdNot(nombre, id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long contarCategoriasActivas() {
        return categoriaRepository.countByActiveTrue();
    }
    
    @Override
    @Transactional(readOnly = true)
    public long contarTotalCategorias() {
        return categoriaRepository.count();
    }
    
    // ========== MÉTODOS AUXILIARES ==========
    
    private CategoriaResponseDTO convertirACategoriaResponseDTO(Categoria categoria) {
        return CategoriaResponseDTO.builder()
            .id(categoria.getId())
            .nombre(categoria.getName())
            .descripcion(categoria.getDescription())
            .activa(categoria.getActive())
            .colorHex(categoria.getColorHex())
            .icono(categoria.getIcon())
            .orden(categoria.getOrder())
            .fechaCreacion(categoria.getCreatedAt())
            .fechaActualizacion(categoria.getUpdatedAt())
            .totalTickets(categoria.getTickets() != null ? (long) categoria.getTickets().size() : 0L)
            .build();
    }
    
    private CategoriaSimpleDTO convertirACategoriaSimpleDTO(Categoria categoria) {
        return CategoriaSimpleDTO.builder()
            .id(categoria.getId())
            .nombre(categoria.getName())
            .colorHex(categoria.getColorHex())
            .icono(categoria.getIcon())
            .orden(categoria.getOrder())
            .activa(categoria.getActive())
            .build();
    }
}
