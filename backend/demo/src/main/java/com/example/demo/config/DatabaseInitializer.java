package com.example.demo.config;

import com.example.demo.asignacion.repository.HistorialAsignacionRepository;
import com.example.demo.asignacion.model.HistorialAsignacion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final HistorialAsignacionRepository historialAsignacionRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Iniciando limpieza de datos de base de datos...");
        
        try {
            // Obtener todos los registros de historial
            List<HistorialAsignacion> historiales = historialAsignacionRepository.findAll();
            
            boolean needsUpdate = false;
            for (HistorialAsignacion historial : historiales) {
                // Si la fecha es null o inválida, actualizarla
                if (historial.getFechaAccion() == null) {
                    historial.setFechaAccion(LocalDateTime.now());
                    historialAsignacionRepository.save(historial);
                    needsUpdate = true;
                    log.info("Actualizada fecha para historial ID: {}", historial.getId());
                }
            }
            
            if (needsUpdate) {
                log.info("Limpieza de base de datos completada exitosamente");
            } else {
                log.info("No se encontraron datos que requieran limpieza");
            }
            
        } catch (Exception e) {
            log.error("Error durante la limpieza de base de datos: {}", e.getMessage());
            // No lanzar la excepción para que la aplicación pueda continuar
        }
    }
}
