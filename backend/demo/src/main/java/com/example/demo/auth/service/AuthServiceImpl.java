package com.example.demo.auth.service;

import com.example.demo.auth.dto.request.ChangeTemporaryPasswordRequest;
import com.example.demo.auth.dto.request.LoginRequest;
import com.example.demo.auth.dto.request.RegisterRequest;
import com.example.demo.auth.dto.request.VerifyEmailRequest;
import com.example.demo.auth.dto.request.ResendVerificationRequest;
import com.example.demo.auth.dto.response.LoginResponse;
import com.example.demo.auth.exception.AuthException;
import com.example.demo.auth.exception.UserAlreadyExistsException;
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

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthServiceImpl implements AuthService {
    
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final EmailVerificationService emailVerificationService;
    
    @Override
    public LoginResponse authenticate(LoginRequest request) {
        log.info("Intento de login para email: {}", request.getEmail());
        
        // 1. Buscar usuario por email
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new AuthException("Credenciales inválidas"));
        
        // 2. Verificar contraseña
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            log.warn("Intento de login fallido para email: {}", request.getEmail());
            throw new AuthException("Credenciales inválidas");
        }
        
        // 3. Verificar que esté activo
        if (!usuario.getActivo()) {
            throw new AuthException("Usuario desactivado. Contacte al administrador");
        }
        
        // 4. Verificar que el email esté verificado
        if (!usuario.getEmailVerificado()) {
            throw new AuthException("Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada");
        }
        
        // 5. Verificar si la contraseña es temporal
        boolean requiereCambioPassword = usuario.getPasswordTemporal() != null && usuario.getPasswordTemporal();
        
        // 6. Actualizar último acceso
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);
        
        // 7. Generar token JWT
        String accessToken = jwtTokenProvider.generateToken(usuario);
        
        // 8. Determinar URL de redirección según tipo de usuario
        String redirectUrl = getRedirectUrlByUserType(usuario.getTipoUsuario());
        
        log.info("Login exitoso para usuario: {} - Tipo: {} - Requiere cambio de contraseña: {}", 
                usuario.getEmail(), usuario.getTipoUsuario(), requiereCambioPassword);
        
        return LoginResponse.builder()
            .accessToken(accessToken)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getTokenValidityInSeconds())
            .userId(usuario.getIdUsuario())
            .nombre(usuario.getNombre())
            .apellido(usuario.getApellido())
            .email(usuario.getEmail())
            .tipoUsuario(usuario.getTipoUsuario().getDescripcion())
            .require2fa(usuario.getRequire2fa())
            .requiereCambioPassword(requiereCambioPassword)
            .redirectUrl(redirectUrl)
            .build();
    }
    
    @Override
    public void registerFuncionario(RegisterRequest request) {
        log.info("Registro de nuevo funcionario: {}", request.getEmail());
        
        // 1. Validar que el email no exista
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Ya existe un usuario con este email");
        }
        
        // 2. Crear nuevo funcionario (inactivo hasta verificar email)
        Usuario funcionario = Usuario.builder()
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .nombre(request.getNombre())
            .apellido(request.getApellido())
            .telefono(request.getTelefono())
            .tipoUsuario(TipoUsuario.FUNCIONARIO)  // Fijo para auto-registro
            .creadoPor(null)  // Auto-registro, no tiene creador
            .activo(false)  // Inactivo hasta verificar email
            .emailVerificado(false)  // Email no verificado
            .require2fa(false)
            .build();
        
        Usuario savedUser = usuarioRepository.save(funcionario);
        
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