package com.example.demo.reports.service;

import com.example.demo.reports.dto.request.GuardarReporteUsuarioRequestDTO;
import com.example.demo.reports.dto.response.ReporteUsuarioResponseDTO;
import com.example.demo.reports.model.ReporteUsuario;
import com.example.demo.reports.repository.ReporteUsuarioRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ReporteUsuarioService {
    
    private final ReporteUsuarioRepository reporteUsuarioRepository;
    private final UsuarioRepository usuarioRepository;
    
    /**
     * Guardar un reporte generado por el usuario
     */
    public ReporteUsuarioResponseDTO guardarReporteUsuario(GuardarReporteUsuarioRequestDTO request, String emailUsuario) {
        log.info("🔍 [REPORTE-USUARIO] Guardando reporte para usuario: {}", emailUsuario);
        
        // Buscar usuario
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Crear entidad
        ReporteUsuario reporte = ReporteUsuario.builder()
            .usuario(usuario)
            .titulo(request.getTitulo())
            .subtitulo(request.getSubtitulo())
            .tipoPeriodo(request.getTipoPeriodo())
            .valorPeriodo(request.getValorPeriodo())
            .nombreArchivo(request.getNombreArchivo())
            .datosReporte(request.getDatosReporte())
            .estadisticas(request.getEstadisticas())
            .categoriasTop(request.getCategoriasTop())
            .tecnicosTop(request.getTecnicosTop())
            .observaciones(request.getObservaciones())
            .fechaGeneracion(LocalDateTime.now())
            .activo(true)
            .build();
        
        // Guardar en base de datos
        ReporteUsuario reporteGuardado = reporteUsuarioRepository.save(reporte);
        log.info("🔍 [REPORTE-USUARIO] Reporte guardado con ID: {}", reporteGuardado.getId());
        
        return convertirAResponseDTO(reporteGuardado);
    }
    
    /**
     * Obtener reportes de un usuario
     */
    @Transactional(readOnly = true)
    public List<ReporteUsuarioResponseDTO> obtenerReportesUsuario(String emailUsuario) {
        log.info("🔍 [REPORTE-USUARIO] Obteniendo reportes para usuario: {}", emailUsuario);
        
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<ReporteUsuario> reportes = reporteUsuarioRepository.findByUsuarioAndActivoTrueOrderByFechaGeneracionDesc(usuario);
        log.info("🔍 [REPORTE-USUARIO] Encontrados {} reportes para usuario {}", reportes.size(), emailUsuario);
        
        return reportes.stream()
            .map(this::convertirAResponseDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener reportes de un usuario con filtros
     */
    @Transactional(readOnly = true)
    public List<ReporteUsuarioResponseDTO> obtenerReportesUsuarioConFiltros(
            String emailUsuario, String tipoPeriodo, String busqueda) {
        log.info("🔍 [REPORTE-USUARIO] Obteniendo reportes con filtros para usuario: {}", emailUsuario);
        
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<ReporteUsuario> reportes;
        
        if (busqueda != null && !busqueda.trim().isEmpty()) {
            // Búsqueda por texto
            reportes = reporteUsuarioRepository.findByUsuarioAndTituloContainingIgnoreCaseAndActivoTrueOrderByFechaGeneracionDesc(
                usuario, busqueda.trim());
        } else if (tipoPeriodo != null && !tipoPeriodo.trim().isEmpty()) {
            // Filtro por tipo de período
            reportes = reporteUsuarioRepository.findByUsuarioAndTipoPeriodoAndActivoTrueOrderByFechaGeneracionDesc(
                usuario, tipoPeriodo);
        } else {
            // Todos los reportes
            reportes = reporteUsuarioRepository.findByUsuarioAndActivoTrueOrderByFechaGeneracionDesc(usuario);
        }
        
        log.info("🔍 [REPORTE-USUARIO] Encontrados {} reportes con filtros", reportes.size());
        
        return reportes.stream()
            .map(this::convertirAResponseDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener un reporte específico
     */
    @Transactional(readOnly = true)
    public ReporteUsuarioResponseDTO obtenerReporteUsuario(Long reporteId, String emailUsuario) {
        log.info("🔍 [REPORTE-USUARIO] Obteniendo reporte {} para usuario: {}", reporteId, emailUsuario);
        
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        ReporteUsuario reporte = reporteUsuarioRepository.findById(reporteId)
            .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));
        
        // Verificar que el reporte pertenece al usuario
        if (!reporte.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permisos para acceder a este reporte");
        }
        
        if (!reporte.getActivo()) {
            throw new RuntimeException("El reporte no está disponible");
        }
        
        return convertirAResponseDTO(reporte);
    }
    
    /**
     * Eliminar un reporte (marcar como inactivo)
     */
    public void eliminarReporteUsuario(Long reporteId, String emailUsuario) {
        log.info("🔍 [REPORTE-USUARIO] Eliminando reporte {} para usuario: {}", reporteId, emailUsuario);
        
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        ReporteUsuario reporte = reporteUsuarioRepository.findById(reporteId)
            .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));
        
        // Verificar que el reporte pertenece al usuario
        if (!reporte.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permisos para eliminar este reporte");
        }
        
        // Marcar como inactivo (soft delete)
        reporte.setActivo(false);
        reporteUsuarioRepository.save(reporte);
        
        log.info("🔍 [REPORTE-USUARIO] Reporte eliminado exitosamente");
    }
    
    /**
     * Obtener estadísticas de reportes del usuario
     */
    @Transactional(readOnly = true)
    public Object obtenerEstadisticasUsuario(String emailUsuario) {
        log.info("🔍 [REPORTE-USUARIO] Obteniendo estadísticas para usuario: {}", emailUsuario);
        
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Long totalReportes = reporteUsuarioRepository.countByUsuarioAndActivoTrue(usuario);
        Long reportesDiarios = reporteUsuarioRepository.countByUsuarioAndTipoPeriodoAndActivoTrue(usuario, "daily");
        Long reportesMensuales = reporteUsuarioRepository.countByUsuarioAndTipoPeriodoAndActivoTrue(usuario, "monthly");
        Long reportesAnuales = reporteUsuarioRepository.countByUsuarioAndTipoPeriodoAndActivoTrue(usuario, "yearly");
        
        Map<String, Object> estadisticas = new HashMap<>();
        estadisticas.put("totalReportes", totalReportes);
        estadisticas.put("reportesDiarios", reportesDiarios);
        estadisticas.put("reportesMensuales", reportesMensuales);
        estadisticas.put("reportesAnuales", reportesAnuales);
        estadisticas.put("usuarioNombre", usuario.getFullName());
        estadisticas.put("usuarioEmail", usuario.getEmail());
        
        return estadisticas;
    }
    
    /**
     * Obtener todos los reportes (para administradores)
     */
    @Transactional(readOnly = true)
    public List<ReporteUsuarioResponseDTO> obtenerTodosLosReportes() {
        log.info("🔍 [REPORTE-USUARIO] Obteniendo todos los reportes");
        
        List<ReporteUsuario> reportes = reporteUsuarioRepository.findByActivoTrueOrderByFechaGeneracionDesc();
        
        return reportes.stream()
            .map(this::convertirAResponseDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Convertir entidad a DTO de respuesta
     */
    private ReporteUsuarioResponseDTO convertirAResponseDTO(ReporteUsuario reporte) {
        return ReporteUsuarioResponseDTO.builder()
            .id(reporte.getId())
            .usuarioId(reporte.getUsuario().getId())
            .usuarioNombre(reporte.getUsuario().getFullName())
            .usuarioEmail(reporte.getUsuario().getEmail())
            .titulo(reporte.getTitulo())
            .subtitulo(reporte.getSubtitulo())
            .tipoPeriodo(reporte.getTipoPeriodo())
            .valorPeriodo(reporte.getValorPeriodo())
            .nombreArchivo(reporte.getNombreArchivo())
            .datosReporte(reporte.getDatosReporte())
            .estadisticas(reporte.getEstadisticas())
            .categoriasTop(reporte.getCategoriasTop())
            .tecnicosTop(reporte.getTecnicosTop())
            .fechaGeneracion(reporte.getFechaGeneracion())
            .observaciones(reporte.getObservaciones())
            .activo(reporte.getActivo())
            .build();
    }
}
