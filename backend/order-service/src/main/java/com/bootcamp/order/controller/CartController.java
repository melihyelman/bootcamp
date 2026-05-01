package com.bootcamp.order.controller;

import com.bootcamp.common.dto.ApiResponse;
import com.bootcamp.order.dto.CartItemRequest;
import com.bootcamp.order.dto.CartResponse;
import com.bootcamp.order.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Sepet işlemleri")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Sepeti görüntüle", description = "Kullanıcının sepetini getirir")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @RequestHeader("X-User-Id") Long userId) {
        CartResponse response = cartService.getCart(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/items")
    @Operation(summary = "Sepete ekle", description = "Sepete yeni ürün ekler")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CartItemRequest request) {
        CartResponse response = cartService.addItemToCart(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ürün sepete eklendi", response));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Sepet öğesi güncelle", description = "Sepetteki ürün miktarını günceller")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        CartResponse response = cartService.updateCartItem(userId, itemId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Sepet güncellendi", response));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Sepetten çıkar", description = "Sepetten ürün çıkarır")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long itemId) {
        CartResponse response = cartService.removeItemFromCart(userId, itemId);
        return ResponseEntity.ok(ApiResponse.success("Ürün sepetten çıkarıldı", response));
    }

    @DeleteMapping
    @Operation(summary = "Sepeti temizle", description = "Sepetteki tüm ürünleri siler")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @RequestHeader("X-User-Id") Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Sepet temizlendi", null));
    }
}
