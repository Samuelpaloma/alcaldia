package com.example.demo.automation.service;

import com.example.demo.automation.dto.request.ReglaAutomatizacionRequestDTO;
import com.example.demo.automation.dto.response.ReglaAutomatizacionResponseDTO;
import com.example.demo.shared.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReglaAutomatizacionService {
    
    // CRUD básico
    ReglaAutomatizacionResponseDTO crearRegla(ReglaAutomatizacionRequestDTO request);
    ReglaAutomatizacionResponseDTO obtenerReglaPorId(Long id);
    ReglaAutomatizacionResponseDTO actualizarRegla(Long id, ReglaAutomatizacionRequestDTO request);
    void eliminarRegla(Long id);
    
    // Listados
    List<ReglaAutomatizacionResponseDTO> obtenerTodasLasReglas();
    PageResponse<ReglaAutomatizacionResponseDTO> obtenerReglasConPaginacion(Pageable pageable);
    List<ReglaAutomatizacionResponseDTO> obtenerReglasActivas();
    
    // Filtros
    PageResponse<ReglaAutomatizacionResponseDTO> buscarReglas(String nombre, Boolean activa, Integer prioridad, Pageable pageable);
    
    // Gestión de estado
    ReglaAutomatizacionResponseDTO toggleEstadoRegla(Long id);
    
    // Estadísticas
    Long contarReglasActivas();
    Long contarEjecucionesTotales();
    
    // Ejecución de reglas
    void ejecutarReglas();
    void ejecutarRegla(Long id);

    // Ejecución de reglas con contexto de ticket
    void ejecutarReglasParaTicket(com.example.demo.ticket.model.Ticket ticket);
}
