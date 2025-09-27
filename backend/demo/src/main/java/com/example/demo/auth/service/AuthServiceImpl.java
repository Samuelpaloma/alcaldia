package com.example.demo.auth.service;

import com.example.demo.auth.dto.request.*;
import com.example.demo.auth.dto.response.LoginResponse;
import com.example.demo.auth.exception.AuthException;
import com.example.demo.auth.exception.UserAlreadyExistsException;
import com.example.demo.auth.model.PendingUser;
import com.example.demo.auth.repository.PendingUserRepository;
import com.example.demo.security.JwtTokenProvider;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    
    private final UsuarioRepository usuarioRepository;
    private final PendingUserRepository pendingUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    // ========== REGISTRO ==========
    
    @Override
    @Transactional
    public PendingUser createPendingUser(RegisterRequest request) {
        log.info("Creando usuario pendiente para email: {}", request.getEmail());
        
        // Validación de seguridad: verificar si ya existe un usuario activo
        validateUserNotExists(request.getEmail());
        
        // Limpiar usuarios pendientes anteriores para el mismo email
        cleanupExistingPendingUsers(request.getEmail());
        
        // Generar código de verificación seguro
        String verificationCode = generateSecureVerificationCode();
        
        // Crear usuario pendiente con datos seguros
        PendingUser pendingUser = createSecurePendingUser(request, verificationCode);
        
        return pendingUserRepository.save(pendingUser);
    }
    
    /**
     * Valida que el usuario no exista en la base de datos
     */
    private void validateUserNotExists(String email) {
        if (usuarioRepository.findByEmail(email).isPresent()) {
            log.warn("Intento de registro con email existente: {}", email);
            throw new UserAlreadyExistsException("Este correo electrónico ya está registrado en el sistema");
        }
    }
    
    /**
     * Limpia usuarios pendientes existentes para el mismo email
     */
    private void cleanupExistingPendingUsers(String email) {
        pendingUserRepository.findByEmailAndVerified(email, false)
            .ifPresent(pendingUser -> {
                log.info("Eliminando usuario pendiente existente para: {}", email);
                pendingUserRepository.delete(pendingUser);
            });
    }
    
    /**
     * Crea un usuario pendiente con datos seguros
     */
    private PendingUser createSecurePendingUser(RegisterRequest request, String verificationCode) {
        return PendingUser.builder()
            .email(request.getEmail().toLowerCase().trim()) // Normalizar email
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .nombre(request.getNombre().trim())
            .apellido(request.getApellido().trim())
            .telefono(request.getTelefono() != null ? request.getTelefono().trim() : null)
            .verificationCode(verificationCode)
            .codeExpiration(LocalDateTime.now().plusMinutes(15))
            .createdAt(LocalDateTime.now())
            .verified(false)
            .verificationType(PendingUser.VerificationType.REGISTRATION)
            .build();
    }
    
    @Override
    @Transactional
    public LoginResponse verifyEmailAndCompleteRegistration(VerifyEmailRequest request) {
        log.info("Verificando email para: {}", request.getEmail());
        
        // Validar y obtener usuario pendiente
        PendingUser pendingUser = validateAndGetPendingUser(request.getEmail(), request.getCode());
        
        // Verificar que sea de tipo REGISTRATION
        validateVerificationType(pendingUser, PendingUser.VerificationType.REGISTRATION);
        
        // Crear usuario real con datos seguros
        Usuario usuario = createSecureUser(pendingUser);
        Usuario savedUsuario = usuarioRepository.save(usuario);
        
        // Limpiar usuario pendiente
        pendingUserRepository.delete(pendingUser);
        
        // Generar token JWT seguro
        String accessToken = jwtTokenProvider.generateToken(savedUsuario);
        
        // Crear respuesta de login segura
        return createSecureLoginResponse(savedUsuario, accessToken);
    }
    
    /**
     * Valida y obtiene el usuario pendiente
     */
    private PendingUser validateAndGetPendingUser(String email, String code) {
        Optional<PendingUser> pendingUserOpt = pendingUserRepository
            .findByEmailAndVerificationCode(email.toLowerCase().trim(), code);
        
        if (pendingUserOpt.isEmpty()) {
            log.warn("Intento de verificación con código incorrecto para: {}", email);
            throw new AuthException("El código es incorrecto o no existe");
        }
        
        PendingUser pendingUser = pendingUserOpt.get();
        
        // Verificar si el código ha expirado
        if (pendingUser.getCodeExpiration().isBefore(LocalDateTime.now())) {
            log.warn("Código expirado para: {} - Expiración: {}", email, pendingUser.getCodeExpiration());
            throw new AuthException("El código ha expirado");
        }
        
        return pendingUser;
    }
    
    /**
     * Valida el tipo de verificación
     */
    private void validateVerificationType(PendingUser pendingUser, PendingUser.VerificationType expectedType) {
        if (pendingUser.getVerificationType() != expectedType) {
            log.warn("Tipo de verificación incorrecto para: {} - Esperado: {}, Actual: {}", 
                    pendingUser.getEmail(), expectedType, pendingUser.getVerificationType());
            throw new AuthException("Código de verificación inválido para " + expectedType.name().toLowerCase());
        }
    }
    
    /**
     * Crea un usuario seguro
     */
    private Usuario createSecureUser(PendingUser pendingUser) {
        return Usuario.builder()
            .email(pendingUser.getEmail())
            .passwordHash(pendingUser.getPasswordHash())
            .nombre(pendingUser.getNombre())
            .apellido(pendingUser.getApellido())
            .telefono(pendingUser.getTelefono())
            .tipoUsuario(TipoUsuario.FUNCIONARIO)
            .activo(true)
            .emailVerificado(true) // Marcar como verificado
            .fechaCreacion(LocalDateTime.now())
            .build();
    }
    
    /**
     * Crea una respuesta de login segura
     */
    private LoginResponse createSecureLoginResponse(Usuario usuario, String accessToken) {
        return LoginResponse.builder()
            .accessToken(accessToken)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getTokenValidityInSeconds())
            .userId(usuario.getIdUsuario())
            .nombre(usuario.getNombre())
            .apellido(usuario.getApellido())
            .email(usuario.getEmail())
            .tipoUsuario(usuario.getTipoUsuario().name())
            .require2fa(false)
            .build();
    }
    
    @Override
    @Transactional
    public PendingUser resendVerificationCode(String email) {
        log.info("Reenviando código de verificación para: {}", email);
        
        PendingUser pendingUser = pendingUserRepository
            .findByEmailAndVerified(email, false)
            .orElseThrow(() -> new AuthException("No hay registro pendiente para este email"));
        
        // Generar nuevo código
        String newCode = generateVerificationCode();
        pendingUser.setVerificationCode(newCode);
        pendingUser.setCodeExpiration(LocalDateTime.now().plusMinutes(15));
        
        return pendingUserRepository.save(pendingUser);
    }
    
    // ========== LOGIN ==========
    
    @Override
    public LoginResponse authenticateWithVerification(LoginRequest request) {
        log.info("Autenticación con verificación para: {}", request.getEmail());
        
        // Verificar credenciales
        validateCredentials(request);
        
        // Crear verificación de login
        createLoginVerification(request);
        
        // No devolver token aún, el usuario debe verificar el código
        throw new AuthException("Se requiere verificación de código. Usa el endpoint /verify-login-code");
    }
    
    @Override
    public void validateCredentials(LoginRequest request) {
        log.info("Validación de credenciales para email: {}", request.getEmail());
        
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new AuthException("El correo electrónico no está registrado"));
        
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new AuthException("La contraseña es incorrecta");
        }
        
        if (!usuario.getActivo()) {
            throw new AuthException("Tu cuenta ha sido desactivada. Contacta al administrador");
        }
    }
    
    @Override
    @Transactional
    public PendingUser createLoginVerification(LoginRequest request) {
        log.info("Creando verificación de login para: {}", request.getEmail());
        
        // Verificar que el usuario existe y está activo
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new AuthException("El correo electrónico no está registrado"));
        
        log.info("Usuario encontrado: {} - Activo: {}", usuario.getEmail(), usuario.getActivo());
        
        if (!usuario.getActivo()) {
            throw new AuthException("Tu cuenta ha sido desactivada. Contacta al administrador");
        }
        
        // Eliminar verificaciones anteriores de forma segura
        try {
            // Usar el método directo para eliminar por email
            pendingUserRepository.deleteByEmail(request.getEmail());
            log.info("Eliminadas verificaciones anteriores para: {}", request.getEmail());
        } catch (Exception e) {
            log.warn("Error eliminando verificaciones anteriores para {}: {}", request.getEmail(), e.getMessage());
            // Continuar con la creación del nuevo registro
        }
        
        // Crear nueva verificación
        String verificationCode = generateVerificationCode();
        log.info("Código de verificación generado: {}", verificationCode);
        
        PendingUser pendingUser = PendingUser.builder()
            .email(request.getEmail())
            .passwordHash(usuario.getPasswordHash()) // No necesario, pero para consistencia
            .nombre(usuario.getNombre())
            .apellido(usuario.getApellido())
            .telefono(usuario.getTelefono())
            .verificationCode(verificationCode)
            .codeExpiration(LocalDateTime.now().plusMinutes(15))
            .createdAt(LocalDateTime.now())
            .verified(false)
            .verificationType(PendingUser.VerificationType.LOGIN)
            .build();
        
        PendingUser savedPendingUser = pendingUserRepository.save(pendingUser);
        log.info("Usuario pendiente guardado con ID: {}", savedPendingUser.getId());
        
        return savedPendingUser;
    }
    
    @Override
    @Transactional
    public LoginResponse verifyLoginCode(VerifyEmailRequest request) {
        log.info("Verificando código de login para: {}", request.getEmail());
        
        // Buscar usuario pendiente
        log.info("🔍 Buscando usuario pendiente - Email: {}, Código: {}", request.getEmail(), request.getCode());
        
        Optional<PendingUser> pendingUserOpt = pendingUserRepository
            .findByEmailAndVerificationCode(request.getEmail(), request.getCode());
        
        log.info("🔍 Usuario encontrado: {}", pendingUserOpt.isPresent());
        
        if (pendingUserOpt.isEmpty()) {
            throw new AuthException("El código es incorrecto o no existe");
        }
        
        PendingUser pendingUser = pendingUserOpt.get();
        log.info("🔍 Usuario pendiente encontrado - ID: {}, Expiración: {}, Ahora: {}", 
                pendingUser.getId(), pendingUser.getCodeExpiration(), LocalDateTime.now());
        
        // Verificar si el código ha expirado
        if (pendingUser.getCodeExpiration().isBefore(LocalDateTime.now())) {
            log.warn("⚠️ Código expirado - Expiración: {}, Ahora: {}", 
                    pendingUser.getCodeExpiration(), LocalDateTime.now());
            throw new AuthException("El código ha expirado");
        }
        
        // Verificar que sea de tipo LOGIN
        if (pendingUser.getVerificationType() != PendingUser.VerificationType.LOGIN) {
            throw new AuthException("Código de verificación inválido para login");
        }
        
        // Buscar usuario real
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new AuthException("Usuario no encontrado"));
        
        // Eliminar usuario pendiente
        pendingUserRepository.delete(pendingUser);
        
        // Generar token JWT
        String accessToken = jwtTokenProvider.generateToken(usuario);
        
        return LoginResponse.builder()
            .accessToken(accessToken)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getTokenValidityInSeconds())
            .userId(usuario.getIdUsuario())
            .nombre(usuario.getNombre())
            .apellido(usuario.getApellido())
            .email(usuario.getEmail())
            .tipoUsuario(usuario.getTipoUsuario().name())
            .require2fa(false)
            .build();
    }
    
    // ========== RECUPERACIÓN DE CONTRASEÑA ==========
    
    @Override
    @Transactional
    public PendingUser createPasswordResetVerification(String email) {
        log.info("Creando verificación de reset de contraseña para: {}", email);
        
        // Verificar que el usuario existe
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new AuthException("Usuario no encontrado"));
        
        // Eliminar verificaciones anteriores de forma segura
        try {
            // Usar el método directo para eliminar por email
            pendingUserRepository.deleteByEmail(email);
            log.info("Eliminadas verificaciones anteriores para: {}", email);
        } catch (Exception e) {
            log.warn("Error eliminando verificaciones anteriores para {}: {}", email, e.getMessage());
            // Continuar con la creación del nuevo registro
        }
        
        // Crear nueva verificación
        String verificationCode = generateVerificationCode();
        
        PendingUser pendingUser = PendingUser.builder()
            .email(email)
            .passwordHash(usuario.getPasswordHash())
            .nombre(usuario.getNombre())
            .apellido(usuario.getApellido())
            .telefono(usuario.getTelefono())
            .verificationCode(verificationCode)
            .codeExpiration(LocalDateTime.now().plusMinutes(15))
            .createdAt(LocalDateTime.now())
            .verified(false)
            .verificationType(PendingUser.VerificationType.PASSWORD_RESET)
            .build();
        
        return pendingUserRepository.save(pendingUser);
    }
    
    @Override
    @Transactional
    public LoginResponse resetPasswordWithCode(ResetPasswordRequest request) {
        log.info("Reset de contraseña con código para: {}", request.getEmail());
        
        try {
            // Buscar usuario pendiente usando el método que funciona
            Optional<PendingUser> pendingUserOpt = pendingUserRepository
                .findByEmailAndVerificationCode(request.getEmail(), request.getToken());
            
            if (pendingUserOpt.isEmpty()) {
                log.warn("No se encontró usuario pendiente para: {} con código: {}", request.getEmail(), request.getToken());
                throw new AuthException("El código es incorrecto o no existe");
            }
            
            PendingUser pendingUser = pendingUserOpt.get();
            log.info("Usuario pendiente encontrado: {}", pendingUser.getId());
            
            // Verificar si el código ha expirado
            if (pendingUser.getCodeExpiration().isBefore(LocalDateTime.now())) {
                log.warn("Código expirado para: {} - Expiración: {}", request.getEmail(), pendingUser.getCodeExpiration());
                throw new AuthException("El código ha expirado");
            }
            
            // Verificar que sea de tipo PASSWORD_RESET
            if (pendingUser.getVerificationType() != PendingUser.VerificationType.PASSWORD_RESET) {
                log.warn("Tipo de verificación incorrecto para: {} - Tipo: {}", request.getEmail(), pendingUser.getVerificationType());
                throw new AuthException("Código de verificación inválido para reset de contraseña");
            }
            
            // Buscar usuario real
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Usuario no encontrado"));
            
            log.info("Usuario encontrado: {} - ID: {}", usuario.getEmail(), usuario.getIdUsuario());
            
            // Actualizar contraseña
            usuario.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            usuarioRepository.save(usuario);
            log.info("Contraseña actualizada para usuario: {}", usuario.getEmail());
            
            // Eliminar usuario pendiente
            pendingUserRepository.delete(pendingUser);
            log.info("Usuario pendiente eliminado: {}", pendingUser.getId());
            
            // Generar token JWT para auto-login
            String accessToken = jwtTokenProvider.generateToken(usuario);
            log.info("Token JWT generado para: {}", usuario.getEmail());
            
            // Obtener validez del token
            Long expiresIn = jwtTokenProvider.getTokenValidityInSeconds();
            log.info("Token válido por: {} segundos", expiresIn);
            
            log.info("Contraseña actualizada exitosamente para: {}", request.getEmail());
            
            // Devolver LoginResponse para auto-login
            return LoginResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .userId(usuario.getIdUsuario())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .tipoUsuario(usuario.getTipoUsuario().name())
                .require2fa(false)
                .build();
                
        } catch (AuthException e) {
            log.error("Error de autenticación en reset de contraseña: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado en reset de contraseña para: {}", request.getEmail(), e);
            throw new AuthException("Error interno del servidor: " + e.getMessage());
        }
    }
    
    // ========== UTILIDADES ==========
    
    @Override
    public void changeTemporaryPassword(String token, ChangeTemporaryPasswordRequest request) {
        log.info("Cambiando contraseña temporal para token: {}", token.substring(0, 10) + "...");
        
        // 1. Validar que las contraseñas coincidan
        if (!request.isPasswordMatching()) {
            throw new RuntimeException("Las contraseñas no coinciden");
        }
        
        // 2. Obtener usuario del token
        Long userId = jwtTokenProvider.getUserIdFromJWT(token);
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // 3. Verificar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(request.getCurrentPassword(), usuario.getPasswordHash())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }
        
        // 4. Verificar que la contraseña sea temporal
        if (usuario.getPasswordTemporal() == null || !usuario.getPasswordTemporal()) {
            throw new RuntimeException("Este usuario no tiene una contraseña temporal");
        }
        
        // 5. Actualizar contraseña
        usuario.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        usuario.setPasswordTemporal(false); // Ya no es temporal
        usuarioRepository.save(usuario);
        
        log.info("Contraseña temporal cambiada exitosamente para usuario: {}", usuario.getEmail());
    }
    
    @Override
    public void changePassword(String token, com.example.demo.usuario.dto.request.ChangePasswordRequest request) {
        log.info("Cambiando contraseña para token: {}", token.substring(0, 10) + "...");
        
        // 1. Validar que las contraseñas coincidan
        if (!request.isPasswordMatching()) {
            throw new RuntimeException("Las contraseñas no coinciden");
        }
        
        // 2. Obtener usuario del token
        Long userId = jwtTokenProvider.getUserIdFromJWT(token);
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // 3. Verificar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(request.getCurrentPassword(), usuario.getPasswordHash())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }
        
        // 4. Actualizar contraseña
        usuario.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        usuarioRepository.save(usuario);
        
        log.info("Contraseña cambiada exitosamente para usuario: {}", usuario.getEmail());
    }
    
    @Override
    public void logout(String token) {
        // Invalidar token (implementar blacklist si es necesario)
        log.info("Usuario cerró sesión");
    }
    
    @Override
    public void verifyToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new AuthException("Token inválido o expirado");
        }
    }
    
    /**
     * Genera un código de verificación seguro de 6 dígitos
     */
    private String generateSecureVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6 dígitos
        return String.valueOf(code);
    }
    
    /**
     * Genera un código de verificación (método legacy para compatibilidad)
     */
    private String generateVerificationCode() {
        return generateSecureVerificationCode();
    }
    
    @Override
    public long getUserCount() {
        return usuarioRepository.count();
    }
}