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
                .nombre("Hardware")
                .descripcion("Problemas relacionados con equipos físicos")
                .activa(true)
                .build();
            categoriaRepository.save(hardware);
            
            Categoria software = Categoria.builder()
                .nombre("Software")
                .descripcion("Problemas relacionados con aplicaciones y sistemas")
                .activa(true)
                .build();
            categoriaRepository.save(software);
            
            Categoria red = Categoria.builder()
                .nombre("Red")
                .descripcion("Problemas de conectividad y red")
                .activa(true)
                .build();
            categoriaRepository.save(red);
            
            Categoria usuario = Categoria.builder()
                .nombre("Usuario")
                .descripcion("Solicitudes de soporte de usuario")
                .activa(true)
                .build();
            categoriaRepository.save(usuario);
            
            // 2. Obtener técnico
            Usuario tecnico = usuarioRepository.findByEmail("tecnico@alcaldianevila.gov.co")
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
            
            // 3. Crear tickets de muestra
            Ticket ticket1 = new Ticket();
            ticket1.setConsulta("Problema con impresora en oficina 201");
            ticket1.setDescripcion("La impresora HP LaserJet no está imprimiendo correctamente. Los documentos se quedan en cola.");
            ticket1.setPrioridad("MEDIA");
            ticket1.setEstado("PENDIENTE");
            ticket1.setUbicacion("Oficina 201 - Piso 2");
            ticket1.setTecnicoAsignado(tecnico);
            ticket1.setCreador(tecnico);
            ticket1.setCategoria(hardware);
            ticket1.setFechaCreacion(LocalDateTime.now());
            ticket1.setFechaActualizacion(LocalDateTime.now());
            ticketRepository.save(ticket1);
            
            Ticket ticket2 = new Ticket();
            ticket2.setConsulta("Actualización de software requerida");
            ticket2.setDescripcion("Necesito actualizar el sistema operativo en los equipos del área administrativa.");
            ticket2.setPrioridad("ALTA");
            ticket2.setEstado("EN_PROCESO");
            ticket2.setUbicacion("Área Administrativa");
            ticket2.setTecnicoAsignado(tecnico);
            ticket2.setCreador(tecnico);
            ticket2.setCategoria(software);
            ticket2.setFechaCreacion(LocalDateTime.now());
            ticket2.setFechaActualizacion(LocalDateTime.now());
            ticketRepository.save(ticket2);
            
            Ticket ticket3 = new Ticket();
            ticket3.setConsulta("Configuración de red WiFi");
            ticket3.setDescripcion("Configurar nueva red WiFi para el área de reuniones.");
            ticket3.setPrioridad("BAJA");
            ticket3.setEstado("COMPLETADO");
            ticket3.setUbicacion("Sala de Reuniones");
            ticket3.setTecnicoAsignado(tecnico);
            ticket3.setCreador(tecnico);
            ticket3.setCategoria(red);
            ticket3.setFechaCreacion(LocalDateTime.now());
            ticket3.setFechaActualizacion(LocalDateTime.now());
            ticketRepository.save(ticket3);
            
            Ticket ticket4 = new Ticket();
            ticket4.setConsulta("Solicitud de capacitación");
            ticket4.setDescripcion("El personal necesita capacitación en el nuevo sistema de gestión.");
            ticket4.setPrioridad("MEDIA");
            ticket4.setEstado("PENDIENTE");
            ticket4.setUbicacion("Sala de Capacitación");
            ticket4.setTecnicoAsignado(tecnico);
            ticket4.setCreador(tecnico);
            ticket4.setCategoria(usuario);
            ticket4.setFechaCreacion(LocalDateTime.now());
            ticket4.setFechaActualizacion(LocalDateTime.now());
            ticketRepository.save(ticket4);
            
            Ticket ticket5 = new Ticket();
            ticket5.setConsulta("Mantenimiento preventivo");
            ticket5.setDescripcion("Realizar mantenimiento preventivo a los servidores del sistema.");
            ticket5.setPrioridad("ALTA");
            ticket5.setEstado("EN_PROCESO");
            ticket5.setUbicacion("Sala de Servidores");
            ticket5.setTecnicoAsignado(tecnico);
            ticket5.setCreador(tecnico);
            ticket5.setCategoria(hardware);
            ticket5.setFechaCreacion(LocalDateTime.now());
            ticket5.setFechaActualizacion(LocalDateTime.now());
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
