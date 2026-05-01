package com.bootcamp.order.service;

import com.bootcamp.common.exception.ResourceNotFoundException;
import com.bootcamp.order.dto.CartItemRequest;
import com.bootcamp.order.dto.CartResponse;
import com.bootcamp.order.entity.Cart;
import com.bootcamp.order.entity.CartItem;
import com.bootcamp.order.repository.CartRepository;
import com.bootcamp.order.service.impl.CartServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @InjectMocks
    private CartServiceImpl cartService;

    private Cart cart;
    private CartItemRequest cartItemRequest;

    @BeforeEach
    void setUp() {
        cart = Cart.builder()
                .id(1L)
                .userId(1L)
                .items(new ArrayList<>())
                .build();

        cartItemRequest = new CartItemRequest(1L, "Test Product", BigDecimal.valueOf(99.99), 2);
    }

    @Test
    @DisplayName("Get Cart - sepet varsa getirir")
    void getCart_ExistingCart() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));

        CartResponse response = cartService.getCart(1L);

        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getItems()).isEmpty();
    }

    @Test
    @DisplayName("Get Cart - sepet yoksa oluşturur")
    void getCart_CreatesNewCart() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        CartResponse response = cartService.getCart(1L);

        assertThat(response).isNotNull();
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    @DisplayName("Add Item - yeni ürün ekler")
    void addItem_NewProduct() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        CartResponse response = cartService.addItemToCart(1L, cartItemRequest);

        assertThat(response).isNotNull();
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    @DisplayName("Add Item - mevcut ürün miktarını artırır")
    void addItem_ExistingProduct() {
        CartItem existingItem = CartItem.builder()
                .id(1L)
                .cart(cart)
                .productId(1L)
                .productName("Test Product")
                .price(BigDecimal.valueOf(99.99))
                .quantity(1)
                .build();
        cart.getItems().add(existingItem);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        cartService.addItemToCart(1L, cartItemRequest);

        assertThat(existingItem.getQuantity()).isEqualTo(3); // 1 + 2
    }

    @Test
    @DisplayName("Remove Item - ürünü sepetten çıkarır")
    void removeItem_Success() {
        CartItem item = CartItem.builder()
                .id(1L)
                .cart(cart)
                .productId(1L)
                .productName("Test")
                .price(BigDecimal.TEN)
                .quantity(1)
                .build();
        cart.getItems().add(item);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        cartService.removeItemFromCart(1L, 1L);

        assertThat(cart.getItems()).isEmpty();
    }

    @Test
    @DisplayName("Clear Cart - sepeti temizler")
    void clearCart_Success() {
        cart.getItems().add(CartItem.builder().id(1L).cart(cart).build());
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        cartService.clearCart(1L);

        assertThat(cart.getItems()).isEmpty();
    }
}
