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
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdCategoriaNot(request.getNombre(), 0L)) {
            throw new RuntimeException("Ya existe una categoría con el nombre: " + request.getNombre());
        }
        
        // 2. Crear categoría
        Categoria categoria = Categoria.builder()
            .nombre(request.getNombre().trim())
            .descripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null)
            .colorHex(request.getColorHex())
            .icono(request.getIcono())
            .orden(request.getOrden() != null ? request.getOrden() : categoriaRepository.getNextOrden())
            .activa(request.getActiva() != null ? request.getActiva() : true)
            .build();
        
        Categoria savedCategoria = categoriaRepository.save(categoria);
        
        log.info("Categoría creada exitosamente: {} (ID: {})", savedCategoria.getNombre(), savedCategoria.getIdCategoria());
        
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
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdCategoriaNot(request.getNombre(), id)) {
            throw new RuntimeException("Ya existe otra categoría con el nombre: " + request.getNombre());
        }
        
        // 3. Actualizar campos
        categoria.setNombre(request.getNombre().trim());
        categoria.setDescripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null);
        categoria.setColorHex(request.getColorHex());
        categoria.setIcono(request.getIcono());
        categoria.setOrden(request.getOrden() != null ? request.getOrden() : categoria.getOrden());
        categoria.setActiva(request.getActiva() != null ? request.getActiva() : categoria.getActiva());
        
        Categoria updatedCategoria = categoriaRepository.save(categoria);
        
        log.info("Categoría actualizada exitosamente: {} (ID: {})", updatedCategoria.getNombre(), updatedCategoria.getIdCategoria());
        
        return convertirACategoriaResponseDTO(updatedCategoria);
    }
    
    @Override
    public void eliminarCategoria(Long id) {
        log.info("Eliminando categoría ID: {}", id);
        
        Categoria categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
        
        // Soft delete - desactivar en lugar de eliminar
        categoria.setActiva(false);
        categoriaRepository.save(categoria);
        
        log.info("Categoría desactivada exitosamente: {} (ID: {})", categoria.getNombre(), categoria.getIdCategoria());
    }
    
    @Override
    public CategoriaResponseDTO toggleEstadoCategoria(Long id) {
        log.info("Cambiando estado de categoría ID: {}", id);
        
        Categoria categoria = categoriaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
        
        categoria.setActiva(!categoria.getActiva());
        Categoria updatedCategoria = categoriaRepository.save(categoria);
        
        log.info("Estado de categoría {} cambiado a: {}", updatedCategoria.getNombre(), updatedCategoria.getActiva() ? "ACTIVA" : "INACTIVA");
        
        return convertirACategoriaResponseDTO(updatedCategoria);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CategoriaSimpleDTO> obtenerCategoriasActivas() {
        log.info("Obteniendo categorías activas");
        
        List<Categoria> categorias = categoriaRepository.findByActivaTrueOrderByOrdenAsc();
        
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
        return categoriaRepository.existsByNombreIgnoreCaseAndIdCategoriaNot(nombre, 0L);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existeCategoriaPorNombreExcluyendoId(String nombre, Long id) {
        return categoriaRepository.existsByNombreIgnoreCaseAndIdCategoriaNot(nombre, id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long contarCategoriasActivas() {
        return categoriaRepository.countByActivaTrue();
    }
    
    @Override
    @Transactional(readOnly = true)
    public long contarTotalCategorias() {
        return categoriaRepository.count();
    }
    
    // ========== MÉTODOS AUXILIARES ==========
    
    private CategoriaResponseDTO convertirACategoriaResponseDTO(Categoria categoria) {
        return CategoriaResponseDTO.builder()
            .idCategoria(categoria.getIdCategoria())
            .nombre(categoria.getNombre())
            .descripcion(categoria.getDescripcion())
            .activa(categoria.getActiva())
            .colorHex(categoria.getColorHex())
            .icono(categoria.getIcono())
            .orden(categoria.getOrden())
            .fechaCreacion(categoria.getFechaCreacion())
            .fechaActualizacion(categoria.getFechaActualizacion())
            .totalTickets(categoria.getTickets() != null ? (long) categoria.getTickets().size() : 0L)
            .build();
    }
    
    private CategoriaSimpleDTO convertirACategoriaSimpleDTO(Categoria categoria) {
        return CategoriaSimpleDTO.builder()
            .idCategoria(categoria.getIdCategoria())
            .nombre(categoria.getNombre())
            .colorHex(categoria.getColorHex())
            .icono(categoria.getIcono())
            .orden(categoria.getOrden())
            .activa(categoria.getActiva())
            .build();
    }
}
