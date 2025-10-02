package com.example.demo.auth.service;

import com.example.demo.auth.dto.request.*;
import com.example.demo.auth.dto.response.LoginResponse;
import com.example.demo.auth.exception.AuthException;
import com.example.demo.auth.exception.UserAlreadyExistsException;
import com.example.demo.auth.model.PendingUser;
import com.example.demo.auth.repository.PendingUserRepository;
import com.example.demo.auth.service.EmailVerificationService;
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
    private final EmailVerificationService emailVerificationService;
    
    // ========== LOGIN ==========
    
    @Override
    public LoginResponse authenticate(LoginRequest request) {
        log.info("Intento de login para email: {}", request.getEmail());
        
        // DEBUG: Información del request
        System.out.println("=== DEBUG AUTHENTICATE START ===");
        System.out.println("Email recibido: '" + request.getEmail() + "'");
        System.out.println("Password recibido: '" + request.getPassword() + "'");
        System.out.println("Password es null: " + (request.getPassword() == null));
        System.out.println("Email es null: " + (request.getEmail() == null));
        
        // 1. Buscar usuario por email
        System.out.println("🔍 Buscando usuario en BD...");
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> {
                System.out.println("❌ Usuario NO encontrado para email: " + request.getEmail());
                return new RuntimeException("Credenciales inválidas");
            });
        
        System.out.println("✅ Usuario encontrado:");
        System.out.println("  - ID: " + usuario.getId());
        System.out.println("  - Email: " + usuario.getEmail());
        System.out.println("  - Activo: " + usuario.getActive());
        System.out.println("  - Email verificado: " + usuario.getEmailVerified());
        System.out.println("  - Tipo Usuario: " + usuario.getUserType());
        System.out.println("  - Require 2FA: " + usuario.getRequire2fa());
        System.out.println("  - Password hash: " + usuario.getPassword().substring(0, 20) + "...");
        
        // 2. Verificar contraseña
        System.out.println("🔐 Verificando password...");
        System.out.println("Password enviado: '" + request.getPassword() + "'");
        System.out.println("Password hash en BD: '" + usuario.getPassword() + "'");
        
        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), usuario.getPassword());
        System.out.println("Password coincide: " + passwordMatches);
        
        if (!passwordMatches) {
            System.out.println("❌ PASSWORD NO COINCIDE");
            log.warn("Intento de login fallido para email: {}", request.getEmail());
            throw new RuntimeException("Credenciales inválidas");
        }
        
        System.out.println("✅ Password VÁLIDO");
        
        // 3. Verificar que esté activo
        if (!usuario.getActive()) {
            System.out.println("❌ Usuario INACTIVO");
            throw new RuntimeException("Usuario desactivado. Contacte al administrador");
        }
        
        System.out.println("✅ Usuario ACTIVO");
        
        // 4. Verificar que el email esté verificado
        if (!usuario.getEmailVerified()) {
            System.out.println("❌ Email NO VERIFICADO - Requiere verificación");
            log.info("Usuario {} requiere verificación de email", usuario.getEmail());
            
            // Retornar response indicando que requiere verificación de email
            return LoginResponse.builder()
                .accessToken(null)  // Sin token todavía
                .tokenType("Bearer")
                .expiresIn(null)
                .userId(usuario.getId())
                .nombre(usuario.getFirstName())
                .apellido(usuario.getLastName())
                .email(usuario.getEmail())
                .tipoUsuario(usuario.getUserType().getDescripcion())
                .requireEmailVerification(true)  // Indica que requiere verificación de email
                .require2fa(false)  // No requiere 2FA todavía
                .redirectUrl(null)  // Sin redirección todavía
                .build();
        }
        
        System.out.println("✅ Email VERIFICADO");
        
        // 5. Verificar si requiere 2FA
        if (usuario.getRequire2fa() != null && usuario.getRequire2fa()) {
            System.out.println("🔐 Usuario REQUIERE 2FA");
            log.info("Usuario {} requiere 2FA, enviando código de verificación", usuario.getEmail());
            
            try {
                // Enviar código 2FA
                emailVerificationService.send2FACode(usuario);
                System.out.println("✅ Código 2FA enviado exitosamente");
            } catch (Exception e) {
                log.error("Error enviando código 2FA a: {}", usuario.getEmail(), e);
                throw new RuntimeException("Error enviando código de verificación. Intente nuevamente");
            }
            
            // Retornar response SIN token, indicando que requiere 2FA
            return LoginResponse.builder()
                .accessToken(null)  // Sin token todavía
                .tokenType("Bearer")
                .expiresIn(null)
                .userId(usuario.getId())
                .nombre(usuario.getFirstName())
                .apellido(usuario.getLastName())
                .email(usuario.getEmail())
                .tipoUsuario(usuario.getUserType().getDescripcion())
                .require2fa(true)  // Indica que requiere código 2FA
                .redirectUrl(null)  // Sin redirección todavía
                .build();
        }
        
        System.out.println("✅ NO requiere 2FA - procediendo con login normal");
        
        // 6. Si NO requiere 2FA, proceder con login normal
        return completeAuthentication(usuario);
    }
    
    // Método para completar autenticación (usado después de 2FA o login normal)
    private LoginResponse completeAuthentication(Usuario usuario) {
        System.out.println("🏁 Completando autenticación...");
        
        // Actualizar último acceso
        usuario.setLastAccess(LocalDateTime.now());
        usuarioRepository.save(usuario);
        
        // Generar token JWT
        String accessToken = jwtTokenProvider.generateToken(usuario);
        System.out.println("✅ Token generado: " + accessToken.substring(0, 20) + "...");
        
        // Determinar URL de redirección según tipo de usuario
        String redirectUrl = getRedirectUrlByUserType(usuario.getUserType());
        System.out.println("✅ Redirect URL: " + redirectUrl);
        
        log.info("Login completado exitosamente para usuario: {} - Tipo: {}", 
                usuario.getEmail(), usuario.getUserType());
        
        LoginResponse response = LoginResponse.builder()
            .accessToken(accessToken)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getTokenValidityInSeconds())
            .userId(usuario.getId())
            .nombre(usuario.getFirstName())
            .apellido(usuario.getLastName())
            .email(usuario.getEmail())
                .tipoUsuario(usuario.getUserType().getDescripcion())
            .require2fa(false)  // Ya no requiere más 2FA
            .redirectUrl(redirectUrl)
            .build();
        
        System.out.println("✅ LOGIN COMPLETADO EXITOSAMENTE");
        System.out.println("=== DEBUG AUTHENTICATE END ===");
        
        return response;
    }
    
    // Método auxiliar para determinar URL de redirección
    private String getRedirectUrlByUserType(TipoUsuario tipoUsuario) {
        if (tipoUsuario == null) {
            return "/dashboard";
        }
        
        switch (tipoUsuario) {
            case ADMINISTRADOR:
                return "/admin/dashboard";
            case TECNICO:
                return "/tecnico/dashboard";
            case FUNCIONARIO:
                return "/funcionario/dashboard";
            case SUPERADMIN:
                return "/superadmin/dashboard";
            default:
                return "/dashboard";
        }
    }

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
            .password(pendingUser.getPasswordHash())
            .firstName(pendingUser.getNombre())
            .lastName(pendingUser.getApellido())
            .userType(TipoUsuario.FUNCIONARIO)
            .active(true)
            .emailVerified(true) // Marcar como verificado
            .createdAt(LocalDateTime.now())
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
            .userId(usuario.getId())
            .nombre(usuario.getFirstName())
            .apellido(usuario.getLastName())
            .email(usuario.getEmail())
            .tipoUsuario(usuario.getUserType().name())
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
        
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new AuthException("La contraseña es incorrecta");
        }
        
        if (!usuario.getActive()) {
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
        
        log.info("Usuario encontrado: {} - Activo: {}", usuario.getEmail(), usuario.getActive());
        
        if (!usuario.getActive()) {
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
            .passwordHash(usuario.getPassword()) // No necesario, pero para consistencia
            .nombre(usuario.getFirstName())
            .apellido(usuario.getLastName())
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
            .userId(usuario.getId())
            .nombre(usuario.getFirstName())
            .apellido(usuario.getLastName())
            .email(usuario.getEmail())
            .tipoUsuario(usuario.getUserType().name())
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
        
        // Validar que solo usuarios web (SUPERADMIN, ADMINISTRADOR, FUNCIONARIO) puedan recuperar contraseña
        // Los TECNICOS deben usar la aplicación móvil
        if (usuario.getUserType() == TipoUsuario.TECNICO) {
            log.warn("Intento de recuperación de contraseña desde web para usuario TECNICO: {}", email);
            throw new AuthException("Los técnicos deben usar la aplicación móvil para recuperar su contraseña");
        }
        
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
            .passwordHash(usuario.getPassword())
            .nombre(usuario.getFirstName())
            .apellido(usuario.getLastName())
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
            
            log.info("Usuario encontrado: {} - ID: {}", usuario.getEmail(), usuario.getId());
            
            // Actualizar contraseña
            usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
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
                .userId(usuario.getId())
                .nombre(usuario.getFirstName())
                .apellido(usuario.getLastName())
                .email(usuario.getEmail())
                .tipoUsuario(usuario.getUserType().name())
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
        if (!passwordEncoder.matches(request.getCurrentPassword(), usuario.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }
        
        // 4. Verificar que la contraseña sea temporal
        if (usuario.getTemporaryPassword() == null || !usuario.getTemporaryPassword()) {
            throw new RuntimeException("Este usuario no tiene una contraseña temporal");
        }
        
        // 5. Actualizar contraseña
        usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usuario.setTemporaryPassword(false); // Ya no es temporal
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
        if (!passwordEncoder.matches(request.getCurrentPassword(), usuario.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }
        
        // 4. Actualizar contraseña
        usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
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
    
    // ========== 2FA ==========
    
    @Override
    public LoginResponse verify2FAAndCompleteLogin(Long userId, String code) {
        log.info("Verificando código 2FA para usuario ID: {}", userId);
        System.out.println("=== VERIFY 2FA AND COMPLETE LOGIN ===");
        System.out.println("1. User ID recibido: " + userId);
        System.out.println("2. Code recibido: '" + code + "'");
        System.out.println("3. Longitud del código: " + (code != null ? code.length() : "null"));
        
        try {
            // 1. Validaciones básicas
            if (code == null || code.trim().isEmpty()) {
                System.out.println("❌ Código vacío o null");
                throw new RuntimeException("Código de verificación requerido");
            }
            
            if (userId == null || userId <= 0) {
                System.out.println("❌ User ID inválido: " + userId);
                throw new RuntimeException("ID de usuario inválido");
            }
            
            // 2. Buscar usuario
            System.out.println("🔍 Buscando usuario con ID: " + userId);
            Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> {
                    System.out.println("❌ Usuario no encontrado con ID: " + userId);
                    return new RuntimeException("Usuario no encontrado");
                });
            
            System.out.println("✅ Usuario encontrado: " + usuario.getEmail());
            
            // 3. Verificar código 2FA
            System.out.println("🔐 Verificando código 2FA...");
            boolean codeValid = emailVerificationService.verify2FACode(code.trim());
            
            if (!codeValid) {
                System.out.println("❌ Código 2FA inválido o expirado");
                throw new RuntimeException("Código de verificación inválido o expirado");
            }
            
            System.out.println("✅ Código 2FA válido");
            
            // 4. Completar autenticación
            System.out.println("🏁 Completando autenticación 2FA...");
            return completeAuthentication(usuario);
            
        } catch (Exception e) {
            System.out.println("❌ Error en verify2FAAndCompleteLogin: " + e.getMessage());
            log.error("Error verificando 2FA para usuario {}: {}", userId, e.getMessage());
            throw new RuntimeException("Error verificando código 2FA: " + e.getMessage());
        } finally {
            System.out.println("=== END VERIFY 2FA AND COMPLETE LOGIN ===");
        }
    }
    
    @Override
    public void verifyExistingUserEmail(String email, String code) {
        log.info("Verificando email de usuario existente: {}", email);
        System.out.println("=== VERIFY EXISTING USER EMAIL ===");
        System.out.println("Email: " + email);
        System.out.println("Code: " + code);
        
        try {
            // 1. Buscar usuario existente
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            System.out.println("✅ Usuario encontrado: " + usuario.getEmail());
            
            // 2. Verificar código de verificación
            boolean codeValid = emailVerificationService.verify2FACode(code.trim());
            
            if (!codeValid) {
                System.out.println("❌ Código de verificación inválido o expirado");
                throw new RuntimeException("Código de verificación inválido o expirado");
            }
            
            System.out.println("✅ Código de verificación válido");
            
            // 3. Actualizar estado de verificación de email
            usuario.setEmailVerified(true);
            usuarioRepository.save(usuario);
            
            System.out.println("✅ Email verificado exitosamente para: " + email);
            log.info("Email verificado exitosamente para usuario: {}", email);
            
        } catch (Exception e) {
            System.out.println("❌ Error verificando email: " + e.getMessage());
            log.error("Error verificando email para usuario {}: {}", email, e.getMessage());
            throw new RuntimeException("Error verificando email: " + e.getMessage());
        } finally {
            System.out.println("=== END VERIFY EXISTING USER EMAIL ===");
        }
    }
}
