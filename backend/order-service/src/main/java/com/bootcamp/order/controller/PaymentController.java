package com.bootcamp.order.controller;

import com.bootcamp.common.dto.ApiResponse;
import com.bootcamp.order.dto.PaymentRequest;
import com.bootcamp.order.dto.PaymentResponse;
import com.bootcamp.order.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Ödeme işlemleri")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    @Operation(summary = "Ödeme yap", description = "Iyzico ile ödeme işlemi")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Ödeme başarılı", response));
    }
}
