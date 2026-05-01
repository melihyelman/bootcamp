package com.bootcamp.auth.controller;

import com.bootcamp.auth.dto.AuthResponse;
import com.bootcamp.auth.dto.LoginRequest;
import com.bootcamp.auth.dto.RegisterRequest;
import com.bootcamp.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/auth/register - başarılı kayıt")
    void register_ShouldReturn201() throws Exception {
        RegisterRequest request = new RegisterRequest("John", "Doe", "john@test.com", "password123");
        AuthResponse response = AuthResponse.builder()
                .token("jwt-token")
                .email("john@test.com")
                .firstName("John")
                .lastName("Doe")
                .role("ROLE_USER")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("jwt-token"))
                .andExpect(jsonPath("$.data.email").value("john@test.com"));
    }

    @Test
    @DisplayName("POST /api/auth/register - validation hatası")
    void register_InvalidInput_ShouldReturn400() throws Exception {
        RegisterRequest request = new RegisterRequest("", "", "invalid-email", "12");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login - başarılı giriş")
    void login_ShouldReturn200() throws Exception {
        LoginRequest request = new LoginRequest("john@test.com", "password123");
        AuthResponse response = AuthResponse.builder()
                .token("jwt-token")
                .email("john@test.com")
                .role("ROLE_USER")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("jwt-token"));
    }
}
