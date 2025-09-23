package com.example.demo.auth.service;

import com.example.demo.auth.dto.request.LoginRequest;
import com.example.demo.auth.dto.request.RegisterRequest;
import com.example.demo.auth.dto.request.VerifyEmailRequest;
import com.example.demo.auth.dto.request.ResendVerificationRequest;
import com.example.demo.auth.dto.response.LoginResponse;
import com.example.demo.auth.exception.AuthException;
import com.example.demo.auth.exception.UserAlreadyExistsException;
import com.example.demo.security.JwtTokenProvider;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.model.User;
import com.example.demo.usuario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthServiceImpl implements AuthService {
    
    private final UserRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final EmailVerificationService emailVerificationService;
    
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
        User usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> {
                System.out.println("❌ Usuario NO encontrado para email: " + request.getEmail());
                return new AuthException("Credenciales inválidas");
            });
        
        System.out.println("✅ Usuario encontrado:");
        System.out.println("  - ID: " + usuario.getId());
        System.out.println("  - Email: " + usuario.getEmail());
        System.out.println("  - Activo: " + usuario.getActivo());
        System.out.println("  - Email verificado: " + usuario.getEmailVerificado());
        System.out.println("  - Tipo Usuario: " + usuario.getTipoUsuario());
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
            
            // Test adicional con '123456'
            boolean testWith123456 = passwordEncoder.matches("123456", usuario.getPassword());
            System.out.println("Test directo con '123456': " + testWith123456);
            
            // Test codificando el password enviado
            String encodedSent = passwordEncoder.encode(request.getPassword());
            System.out.println("Password enviado codificado: " + encodedSent);
            
            log.warn("Intento de login fallido para email: {}", request.getEmail());
            throw new AuthException("Credenciales inválidas");
        }
        
        System.out.println("✅ Password VÁLIDO");
        
        // 3. Verificar que esté activo
        if (!usuario.getActivo()) {
            System.out.println("❌ Usuario INACTIVO");
            throw new AuthException("Usuario desactivado. Contacte al administrador");
        }
        
        System.out.println("✅ Usuario ACTIVO");
        
        // 4. Verificar que el email esté verificado
        if (!usuario.getEmailVerificado()) {
            System.out.println("❌ Email NO VERIFICADO");
            throw new AuthException("Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada");
        }
        
        System.out.println("✅ Email VERIFICADO");
        
        // 5. NUEVO: Verificar si requiere 2FA
        if (usuario.getRequire2fa() != null && usuario.getRequire2fa()) {
            System.out.println("🔐 Usuario REQUIERE 2FA");
            log.info("Usuario {} requiere 2FA, enviando código de verificación", usuario.getEmail());
            
            try {
                // Enviar código 2FA
                emailVerificationService.send2FACode(usuario);
            } catch (Exception e) {
                log.error("Error enviando código 2FA a: {}", usuario.getEmail(), e);
                throw new AuthException("Error enviando código de verificación. Intente nuevamente");
            }
            
            // Retornar response SIN token, indicando que requiere 2FA
            return LoginResponse.builder()
                .accessToken(null)  // Sin token todavía
                .tokenType("Bearer")
                .expiresIn(null)
                .userId(Long.valueOf(usuario.getId()))
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .tipoUsuario(usuario.getTipoUsuario().getDescripcion())
                .require2fa(true)  // Indica que requiere código 2FA
                .redirectUrl(null)  // Sin redirección todavía
                .build();
        }
        
        System.out.println("✅ NO requiere 2FA - procediendo con login normal");
        
        // 6. Si NO requiere 2FA, proceder con login normal
        return completeAuthentication(usuario);
    }

    // Método para completar autenticación (usado después de 2FA o login normal)
    private LoginResponse completeAuthentication(User usuario) {
        System.out.println("🏁 Completando autenticación...");
        
        // Actualizar último acceso
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);
        
        // Generar token JWT
        String accessToken = jwtTokenProvider.generateToken(usuario);
        System.out.println("✅ Token generado: " + accessToken.substring(0, 20) + "...");
        
        // Determinar URL de redirección según tipo de usuario
        String redirectUrl = getRedirectUrlByUserType(usuario.getTipoUsuario());
        System.out.println("✅ Redirect URL: " + redirectUrl);
        
        log.info("Login completado exitosamente para usuario: {} - Tipo: {}", 
                usuario.getEmail(), usuario.getTipoUsuario());
        
        LoginResponse response = LoginResponse.builder()
            .accessToken(accessToken)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getTokenValidityInSeconds())
            .userId(Long.valueOf(usuario.getId()))
            .nombre(usuario.getNombre())
            .apellido(usuario.getApellido())
            .email(usuario.getEmail())
            .tipoUsuario(usuario.getTipoUsuario().getDescripcion())
            .require2fa(false)  // Ya no requiere más 2FA
            .redirectUrl(redirectUrl)
            .build();
        
        System.out.println("✅ LOGIN COMPLETADO EXITOSAMENTE");
        System.out.println("=== DEBUG AUTHENTICATE END ===");
        
        return response;
    }

    // NUEVO: Método para verificar código 2FA y completar login
    public LoginResponse verify2FAAndCompleteLogin(int userId, String code) {
        log.info("Verificando código 2FA para usuario ID: {}", userId);
        System.out.println("=== VERIFY 2FA AND COMPLETE LOGIN ===");
        System.out.println("User ID: " + userId);
        System.out.println("Code: " + code);
        
        // 1. Buscar usuario
        User usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> {
                System.out.println("❌ Usuario no encontrado con ID: " + userId);
                return new AuthException("Usuario no encontrado");
            });
        
        System.out.println("✅ Usuario encontrado: " + usuario.getEmail());
        
        // 2. Verificar código 2FA
        boolean codeValid = emailVerificationService.verify2FACode(code);
        System.out.println("Código válido: " + codeValid);
        
        if (!codeValid) {
            System.out.println("❌ Código 2FA inválido o expirado");
            throw new AuthException("Código de verificación inválido o expirado");
        }
        
        System.out.println("✅ Código 2FA verificado correctamente");
        
        // 3. Completar autenticación con token
        return completeAuthentication(usuario);
    }
    
    @Override
    public void registerFuncionario(RegisterRequest request) {
        log.info("Registro de nuevo funcionario: {}", request.getEmail());
        
        // 1. Validar que el email no exista
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Ya existe un usuario con este email");
        }
        
        // 2. Crear nuevo funcionario (inactivo hasta verificar email)
        User funcionario = new User();
        funcionario.setEmail(request.getEmail());
        funcionario.setPassword(passwordEncoder.encode(request.getPassword()));
        funcionario.setNombre(request.getNombre());
        funcionario.setApellido(request.getApellido());
        funcionario.setTelefono(request.getTelefono());
        funcionario.setTipoUsuario(TipoUsuario.FUNCIONARIO);  // Fijo para auto-registro
        funcionario.setCreadoPor(null);  // Auto-registro, no tiene creador
        funcionario.setActivo(false);  // Inactivo hasta verificar email
        funcionario.setEmailVerificado(false);  // Email no verificado
        funcionario.setRequire2fa(false);
        
        User savedUser = usuarioRepository.save(funcionario);
        
        // 3. Enviar código de verificación de email
        try {
            emailVerificationService.sendVerificationCode(savedUser);
        } catch (Exception e) {
            log.error("Error enviando código de verificación a: {}", savedUser.getEmail(), e);
            // No fallar el registro por error de email
        }
        
        log.info("Funcionario registrado exitosamente (pendiente de verificación): {}", savedUser.getEmail());
    }
    
    @Override
    public void verifyEmail(VerifyEmailRequest request) {
        log.info("Verificando email con código: {}", request.getCode());
        emailVerificationService.verifyEmail(request.getCode());
    }
    
    @Override
    public void resendVerificationCode(ResendVerificationRequest request) {
        log.info("Reenviando código de verificación a: {}", request.getEmail());
        emailVerificationService.resendVerificationCode(request.getEmail());
    }
    
    @Override
    public void logout(String token) {
        // Invalidar token (implementar blacklist si es necesario)
        // jwtTokenProvider.invalidateToken(token);
        log.info("Usuario cerró sesión");
    }
    
    private String getRedirectUrlByUserType(TipoUsuario tipoUsuario) {
        return switch (tipoUsuario) {
            case FUNCIONARIO -> "/funcionario/dashboard";
            case TECNICO -> "/tecnico/dashboard";
            case ADMINISTRADOR -> "/admin/dashboard";
            case SUPERADMIN -> "/superadmin/dashboard";
        };
    }
}