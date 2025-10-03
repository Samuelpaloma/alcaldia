# Guía para Actualizar a Expo SDK 54

## Problema
Tu aplicación usa Expo SDK 53, pero Expo Go está instalado para SDK 54, causando incompatibilidad al escanear el código QR.

## Solución Implementada

### 1. Archivos Actualizados
- ✅ `app.json` - Agregado `sdkVersion: "54.0.0"`
- ✅ `package.json` - Actualizadas las dependencias a versiones compatibles con SDK 54

### 2. Comandos a Ejecutar

Abre una terminal en la carpeta `movil` y ejecuta los siguientes comandos:

```bash
# 1. Limpiar caché y node_modules
rm -rf node_modules
rm package-lock.json

# 2. Instalar dependencias actualizadas
npm install

# 3. Verificar que todo esté correcto
npx expo doctor

# 4. Iniciar el servidor de desarrollo
npx expo start
```

### 3. Cambios Realizados

#### Dependencias Actualizadas:
- `expo`: `~53.0.20` → `~54.0.0`
- `react`: `19.0.0` → `18.3.1`
- `react-dom`: `19.0.0` → `18.3.1`
- `react-native`: `^0.79.5` → `0.76.3`
- `react-native-safe-area-context`: `5.4.0` → `4.12.0`
- `react-native-web`: `^0.20.0` → `~0.19.13`

#### DevDependencies Actualizadas:
- `@types/react`: `~19.0.10` → `~18.3.12`
- `@types/react-native`: `^0.72.8` → `^0.73.0`
- `typescript`: `~5.8.3` → `~5.3.3`

### 4. Verificación

Después de ejecutar los comandos:

1. **Verifica la versión del SDK**:
   ```bash
   npx expo --version
   ```

2. **Inicia el servidor**:
   ```bash
   npx expo start
   ```

3. **Escanea el código QR** con Expo Go - ahora debería funcionar correctamente.

### 5. Posibles Problemas y Soluciones

#### Error: "Module not found"
```bash
# Limpia completamente y reinstala
rm -rf node_modules package-lock.json
npm install
```

#### Error: "Metro bundler issues"
```bash
# Limpia el caché de Metro
npx expo start --clear
```

#### Error: "TypeScript errors"
```bash
# Verifica la configuración de TypeScript
npx tsc --noEmit
```

### 6. Notas Importantes

- **React 18**: El proyecto ahora usa React 18 en lugar de React 19 para compatibilidad con SDK 54
- **React Native 0.76**: Versión más estable y compatible
- **TypeScript**: Versión compatible con las nuevas dependencias

### 7. Próximos Pasos

1. Ejecuta los comandos de instalación
2. Prueba el escaneo del código QR
3. Verifica que todas las funcionalidades sigan funcionando
4. Si hay errores, revisa la consola y ajusta según sea necesario

## Contacto
Si encuentras problemas durante la actualización, revisa:
- La consola de errores
- Los logs de Metro bundler
- La documentación oficial de Expo SDK 54
