package com.example.demo.automatizacion.service;

import org.springframework.stereotype.Service;

@Service
public class AutomaticResponseService {

    /**
     * Aplica respuesta automática a un ticket
     */
    public void aplicarRespuestaAutomatica(Long ticketId) {
        System.out.println("💬 Aplicando respuesta automática al ticket: " + ticketId);
        // Lógica para generar y aplicar respuestas automáticas
    }

    /**
     * Genera respuesta automática basada en el contenido del ticket
     */
    public String generarRespuestaAutomatica(String contenidoTicket) {
        System.out.println("🤖 Generando respuesta automática para: " + contenidoTicket);
        
        // Lógica simple de respuesta automática basada en palabras clave
        String contenido = contenidoTicket.toLowerCase();
        
        if (contenido.contains("contraseña") || contenido.contains("password")) {
            return "Para restablecer su contraseña, por favor siga estos pasos: 1. Vaya a la página de inicio de sesión, 2. Haga clic en '¿Olvidó su contraseña?', 3. Ingrese su email, 4. Revise su correo electrónico para las instrucciones.";
        }
        
        if (contenido.contains("email") || contenido.contains("correo")) {
            return "Para problemas relacionados con el correo electrónico, por favor verifique: 1. Su conexión a internet, 2. La configuración de su cliente de correo, 3. Que no esté en la carpeta de spam.";
        }
        
        if (contenido.contains("red") || contenido.contains("conexión") || contenido.contains("wifi")) {
            return "Para problemas de red, por favor: 1. Reinicie su router/módem, 2. Verifique que todos los cables estén conectados correctamente, 3. Intente conectarse desde otro dispositivo para descartar problemas del equipo.";
        }
        
        if (contenido.contains("software") || contenido.contains("programa") || contenido.contains("aplicación")) {
            return "Para problemas de software: 1. Reinicie la aplicación, 2. Verifique que tenga la última versión instalada, 3. Si el problema persiste, intente reinstalar el programa.";
        }
        
        // Respuesta genérica
        return "Hemos recibido su consulta. Un técnico especializado revisará su caso y le proporcionará una solución personalizada. Gracias por su paciencia.";
    }
}
