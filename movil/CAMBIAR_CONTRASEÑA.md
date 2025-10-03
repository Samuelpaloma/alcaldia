# Guía para Cambiar Contraseña en la Aplicación Móvil

## Problema Identificado
Los técnicos no pueden usar la funcionalidad de recuperación de contraseña desde la aplicación web debido a restricciones de seguridad implementadas en el backend. El sistema está diseñado para que los técnicos usen únicamente la aplicación móvil para gestionar sus contraseñas.

## Solución Implementada

### 1. Configuración de Red
Se ha actualizado la configuración de la API para usar la IP correcta del servidor:
- **Desarrollo**: `http://192.168.1.87:8080`
- **Producción**: `http://localhost:8080`

### 2. Funcionalidades Disponibles

#### A. Cambio de Contraseña (Usuario Autenticado)
Si ya conoces tu contraseña actual:
1. Inicia sesión en la aplicación móvil
2. Ve a **Configuración** → **Cambiar Contraseña**
3. Ingresa tu contraseña actual
4. Ingresa tu nueva contraseña
5. Confirma la nueva contraseña
6. Presiona "Cambiar Contraseña"

#### B. Recuperación de Contraseña (Usuario No Autenticado)
Si no recuerdas tu contraseña:
1. En la pantalla de login, presiona "¿Olvidaste tu contraseña?"
2. Ingresa tu correo electrónico
3. Revisa tu email para el código de verificación
4. Ingresa el código de 6 dígitos
5. Crea tu nueva contraseña
6. Confirma la nueva contraseña
7. Presiona "Restablecer Contraseña"

### 3. Requisitos de Contraseña
La nueva contraseña debe cumplir con:
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial

### 4. Solución de Problemas

#### Error: "No se pudo conectar con el servidor"
- Verifica que el dispositivo móvil esté en la misma red que el servidor
- Asegúrate de que el servidor esté ejecutándose en el puerto 8080
- Verifica la IP del servidor en la configuración

#### Error: "Los técnicos deben usar la aplicación móvil"
- Este error aparece cuando intentas usar la recuperación desde la aplicación web
- **Solución**: Usa únicamente la aplicación móvil para cambiar contraseñas

#### Error: "Token expirado"
- Tu sesión ha expirado
- **Solución**: Inicia sesión nuevamente

### 5. Flujo de Trabajo Recomendado

1. **Primera vez**: Usa las credenciales proporcionadas por el administrador
2. **Cambio obligatorio**: Si tienes contraseña temporal, cámbiala inmediatamente
3. **Mantenimiento**: Cambia tu contraseña periódicamente por seguridad

### 6. Contacto de Soporte
Si tienes problemas técnicos:
- Contacta al administrador del sistema
- Proporciona el mensaje de error exacto
- Incluye información sobre tu dispositivo y versión de la app

## Notas Técnicas
- La aplicación móvil usa endpoints específicos que permiten a los técnicos gestionar sus contraseñas
- El backend valida el tipo de usuario y permite operaciones según el rol
- Todas las comunicaciones están encriptadas usando HTTPS en producción
