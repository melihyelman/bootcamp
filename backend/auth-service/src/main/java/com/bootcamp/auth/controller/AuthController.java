package com.bootcamp.auth.controller;

import com.bootcamp.auth.dto.AuthResponse;
import com.bootcamp.auth.dto.LoginRequest;
import com.bootcamp.auth.dto.RegisterRequest;
import com.bootcamp.auth.service.AuthService;
import com.bootcamp.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Kimlik doğrulama işlemleri")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Kullanıcı kaydı", description = "Yeni kullanıcı oluşturur ve JWT token döner")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Kayıt başarılı", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Kullanıcı girişi", description = "Email ve şifre ile giriş yaparak JWT token alır")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Giriş başarılı", response));
    }

    @GetMapping("/validate")
    @Operation(summary = "Token doğrulama", description = "JWT token geçerliliğini kontrol eder")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@RequestParam String token) {
        boolean isValid = authService.validateToken(token);
        return ResponseEntity.ok(ApiResponse.success("Token doğrulama", isValid));
    }
}
