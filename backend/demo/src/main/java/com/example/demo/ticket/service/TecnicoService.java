package com.example.demo.ticket.service;

import com.example.demo.ticket.dto.TecnicoDashboardDTO;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.model.User;
import com.example.demo.usuario.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TecnicoService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Obtiene las estadísticas del dashboard para un técnico específico
     * @param tecnicoId ID del técnico
     * @return DTO con las estadísticas
     */
    public TecnicoDashboardDTO getDashboardStats(Integer tecnicoId) {
        System.out.println("🔍 [TECNICO_SERVICE] Obteniendo estadísticas para técnico ID: " + tecnicoId);
        
        // Verificar que el técnico existe
        User tecnico = userRepository.findById(tecnicoId)
            .orElseThrow(() -> {
                System.out.println("❌ [TECNICO_SERVICE] Técnico no encontrado con ID: " + tecnicoId);
                return new RuntimeException("Técnico no encontrado con ID: " + tecnicoId);
            });
        
        System.out.println("✅ [TECNICO_SERVICE] Técnico verificado: " + tecnico.getNombre());
        
        // Obtener estadísticas usando consultas SQL optimizadas
        System.out.println("🔍 [TECNICO_SERVICE] Ejecutando consultas SQL...");
        long ticketsPendientes = ticketRepository.countTicketsPendientesByTecnico(tecnicoId);
        long ticketsEnProceso = ticketRepository.countTicketsEnProcesoByTecnico(tecnicoId);
        long ticketsCompletados = ticketRepository.countTicketsCompletadosByTecnico(tecnicoId);
        long ticketsAsignados = ticketRepository.countTicketsAsignadosByTecnico(tecnicoId);
        
        System.out.println("📊 [TECNICO_SERVICE] Estadísticas obtenidas:");
        System.out.println("  - Pendientes: " + ticketsPendientes);
        System.out.println("  - En Proceso: " + ticketsEnProceso);
        System.out.println("  - Completados: " + ticketsCompletados);
        System.out.println("  - Asignados: " + ticketsAsignados);
        
        return new TecnicoDashboardDTO(
            ticketsPendientes,
            ticketsEnProceso,
            ticketsCompletados,
            ticketsAsignados
        );
    }
    
    /**
     * Obtiene las estadísticas del dashboard para el técnico autenticado
     * @param email Email del técnico autenticado
     * @return DTO con las estadísticas
     */
    public TecnicoDashboardDTO getDashboardStatsByEmail(String email) {
        System.out.println("🔍 [TECNICO_SERVICE] Buscando técnico con email: " + email);
        
        User tecnico = userRepository.findByEmail(email)
            .orElseThrow(() -> {
                System.out.println("❌ [TECNICO_SERVICE] Técnico no encontrado con email: " + email);
                return new RuntimeException("Técnico no encontrado con email: " + email);
            });
        
        System.out.println("✅ [TECNICO_SERVICE] Técnico encontrado: " + tecnico.getNombre() + " (ID: " + tecnico.getId() + ")");
        
        return getDashboardStats(tecnico.getId());
    }
}
