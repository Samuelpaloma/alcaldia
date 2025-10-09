package com.example.demo.superadmin.util;

import java.util.HashMap;
import java.util.Map;

public class TemaUtil {
    
    public static Map<String, String> obtenerColoresTemaClaro() {
        Map<String, String> colores = new HashMap<>();
        colores.put("color_primario", "#000000");  // Negro para botones principales
        colores.put("color_secundario", "#6c757d");
        colores.put("color_fondo", "#ffffff");     // Blanco puro para fondos
        colores.put("color_texto", "#000000");     // Negro puro para texto
        colores.put("color_contenedor", "#ffffff"); // Blanco puro para contenedores
        colores.put("color_contenedor_secundario", "#ffffff"); // Blanco puro para contenedores secundarios
        return colores;
    }
    
    public static Map<String, String> obtenerColoresTemaOscuro() {
        Map<String, String> colores = new HashMap<>();
        colores.put("color_primario", "#ffffff");  // Blanco para botones principales
        colores.put("color_secundario", "#6c757d");
        colores.put("color_fondo", "#1a1a1a");     // Negro oscuro para fondos
        colores.put("color_texto", "#ffffff");     // Blanco para texto
        colores.put("color_contenedor", "#2d2d2d"); // Gris oscuro para contenedores
        colores.put("color_contenedor_secundario", "#3a3a3a"); // Gris más oscuro para contenedores secundarios
        return colores;
    }
    
    public static Map<String, String> obtenerColoresPorTema(String tema) {
        if ("oscuro".equalsIgnoreCase(tema)) {
            return obtenerColoresTemaOscuro();
        } else {
            return obtenerColoresTemaClaro();
        }
    }
}
