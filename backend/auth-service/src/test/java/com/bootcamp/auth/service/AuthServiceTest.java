package com.bootcamp.auth.service;

import com.bootcamp.auth.dto.AuthResponse;
import com.bootcamp.auth.dto.LoginRequest;
import com.bootcamp.auth.dto.RegisterRequest;
import com.bootcamp.auth.entity.Role;
import com.bootcamp.auth.entity.User;
import com.bootcamp.auth.repository.UserRepository;
import com.bootcamp.auth.security.JwtTokenProvider;
import com.bootcamp.auth.service.impl.AuthServiceImpl;
import com.bootcamp.common.exception.BadRequestException;
import com.bootcamp.common.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("John", "Doe", "john@test.com", "password123");
        loginRequest = new LoginRequest("john@test.com", "password123");
        user = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@test.com")
                .password("encodedPassword")
                .role(Role.ROLE_USER)
                .build();
    }

    @Test
    @DisplayName("Register - başarılı kayıt")
    void register_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtTokenProvider.generateToken(anyString(), anyString(), anyString())).thenReturn("jwt-token");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("john@test.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Register - email zaten kayıtlı")
    void register_EmailAlreadyExists() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("zaten kayıtlı");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login - başarılı giriş")
    void login_Success() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken(anyString(), anyString(), anyString())).thenReturn("jwt-token");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Login - geçersiz kimlik bilgileri")
    void login_InvalidCredentials() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @DisplayName("Validate Token - geçerli token")
    void validateToken_Valid() {
        when(jwtTokenProvider.validateToken("valid-token")).thenReturn(true);
        assertThat(authService.validateToken("valid-token")).isTrue();
    }

    @Test
    @DisplayName("Validate Token - geçersiz token")
    void validateToken_Invalid() {
        when(jwtTokenProvider.validateToken("invalid-token")).thenReturn(false);
        assertThat(authService.validateToken("invalid-token")).isFalse();
    }
}
