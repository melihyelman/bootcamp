package com.bootcamp.auth.service;

import com.bootcamp.auth.dto.AuthResponse;
import com.bootcamp.auth.dto.LoginRequest;
import com.bootcamp.auth.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    boolean validateToken(String token);
}
