package com.bootcamp.order.controller;

import com.bootcamp.common.dto.ApiResponse;
import com.bootcamp.order.dto.OrderRequest;
import com.bootcamp.order.dto.OrderResponse;
import com.bootcamp.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Sipariş yönetimi")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Sipariş oluştur", description = "Sepetteki ürünlerden sipariş oluşturur")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sipariş oluşturuldu", response));
    }

    @GetMapping
    @Operation(summary = "Siparişleri listele", description = "Kullanıcının tüm siparişlerini listeler")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders(
            @RequestHeader("X-User-Id") Long userId) {
        List<OrderResponse> response = orderService.getUserOrders(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Sipariş detay", description = "Sipariş detayını getirir")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId) {
        OrderResponse response = orderService.getOrderById(userId, orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
