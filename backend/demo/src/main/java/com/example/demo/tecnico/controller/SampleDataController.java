package com.example.demo.tecnico.controller;

import com.example.demo.categoria.model.Categoria;
import com.example.demo.categoria.repository.CategoriaRepository;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sample")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SampleDataController {
    
    private final CategoriaRepository categoriaRepository;
    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    
    /**
     * Crear datos de muestra para testing
     * POST /api/sample/create
     */
    @PostMapping("/create")
    public ResponseEntity<?> createSampleData() {
        try {
            log.info("Creando datos de muestra...");
            
            // 1. Crear categorías
            Categoria hardware = Categoria.builder()
                .name("Hardware")
                .description("Problemas relacionados con equipos físicos")
                .active(true)
                .build();
            categoriaRepository.save(hardware);
            
            Categoria software = Categoria.builder()
                .name("Software")
                .description("Problemas relacionados con aplicaciones y sistemas")
                .active(true)
                .build();
            categoriaRepository.save(software);
            
            Categoria red = Categoria.builder()
                .name("Red")
                .description("Problemas de conectividad y red")
                .active(true)
                .build();
            categoriaRepository.save(red);
            
            Categoria usuario = Categoria.builder()
                .name("Usuario")
                .description("Solicitudes de soporte de usuario")
                .active(true)
                .build();
            categoriaRepository.save(usuario);
            
            // 2. Obtener técnico
            Usuario tecnico = usuarioRepository.findByEmail("tecnico@alcaldianevila.gov.co")
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
            
            // 3. Crear tickets de muestra
            Ticket ticket1 = new Ticket();
            ticket1.setQuery("Problema con impresora en oficina 201");
            ticket1.setDescription("La impresora HP LaserJet no está imprimiendo correctamente. Los documentos se quedan en cola.");
            ticket1.setPriority("MEDIA");
            ticket1.setStatus("PENDIENTE");
            ticket1.setLocation("Oficina 201 - Piso 2");
            ticket1.setAssignedTechnician(tecnico);
            ticket1.setCreator(tecnico);
            ticket1.setCategory(hardware);
            ticket1.setCreatedAt(LocalDateTime.now());
            ticket1.setUpdatedAt(LocalDateTime.now());
            ticketRepository.save(ticket1);
            
            Ticket ticket2 = new Ticket();
            ticket2.setQuery("Actualización de software requerida");
            ticket2.setDescription("Necesito actualizar el sistema operativo en los equipos del área administrativa.");
            ticket2.setPriority("ALTA");
            ticket2.setStatus("EN_PROCESO");
            ticket2.setLocation("Área Administrativa");
            ticket2.setAssignedTechnician(tecnico);
            ticket2.setCreator(tecnico);
            ticket2.setCategory(software);
            ticket2.setCreatedAt(LocalDateTime.now());
            ticket2.setUpdatedAt(LocalDateTime.now());
            ticketRepository.save(ticket2);
            
            Ticket ticket3 = new Ticket();
            ticket3.setQuery("Configuración de red WiFi");
            ticket3.setDescription("Configurar nueva red WiFi para el área de reuniones.");
            ticket3.setPriority("BAJA");
            ticket3.setStatus("COMPLETADO");
            ticket3.setLocation("Sala de Reuniones");
            ticket3.setAssignedTechnician(tecnico);
            ticket3.setCreator(tecnico);
            ticket3.setCategory(red);
            ticket3.setCreatedAt(LocalDateTime.now());
            ticket3.setUpdatedAt(LocalDateTime.now());
            ticketRepository.save(ticket3);
            
            Ticket ticket4 = new Ticket();
            ticket4.setQuery("Solicitud de capacitación");
            ticket4.setDescription("El personal necesita capacitación en el nuevo sistema de gestión.");
            ticket4.setPriority("MEDIA");
            ticket4.setStatus("PENDIENTE");
            ticket4.setLocation("Sala de Capacitación");
            ticket4.setAssignedTechnician(tecnico);
            ticket4.setCreator(tecnico);
            ticket4.setCategory(usuario);
            ticket4.setCreatedAt(LocalDateTime.now());
            ticket4.setUpdatedAt(LocalDateTime.now());
            ticketRepository.save(ticket4);
            
            Ticket ticket5 = new Ticket();
            ticket5.setQuery("Mantenimiento preventivo");
            ticket5.setDescription("Realizar mantenimiento preventivo a los servidores del sistema.");
            ticket5.setPriority("ALTA");
            ticket5.setStatus("EN_PROCESO");
            ticket5.setLocation("Sala de Servidores");
            ticket5.setAssignedTechnician(tecnico);
            ticket5.setCreator(tecnico);
            ticket5.setCategory(hardware);
            ticket5.setCreatedAt(LocalDateTime.now());
            ticket5.setUpdatedAt(LocalDateTime.now());
            ticketRepository.save(ticket5);
            
            log.info("Datos de muestra creados exitosamente");
            
            return ResponseEntity.ok("Datos de muestra creados exitosamente");
            
        } catch (Exception e) {
            log.error("Error creando datos de muestra", e);
            return ResponseEntity.badRequest().body("Error creando datos de muestra: " + e.getMessage());
        }
    }
    
    /**
     * Limpiar datos de muestra
     * DELETE /api/sample/clean
     */
    @DeleteMapping("/clean")
    public ResponseEntity<?> cleanSampleData() {
        try {
            log.info("Limpiando datos de muestra...");
            
            // Eliminar todos los tickets
            ticketRepository.deleteAll();
            
            // Eliminar todas las categorías
            categoriaRepository.deleteAll();
            
            log.info("Datos de muestra eliminados exitosamente");
            
            return ResponseEntity.ok("Datos de muestra eliminados exitosamente");
            
        } catch (Exception e) {
            log.error("Error limpiando datos de muestra", e);
            return ResponseEntity.badRequest().body("Error limpiando datos de muestra: " + e.getMessage());
        }
    }
}
