package com.bootcamp.order.service;

import com.bootcamp.order.dto.CartItemRequest;
import com.bootcamp.order.dto.CartResponse;

public interface CartService {

    CartResponse getCart(Long userId);

    CartResponse addItemToCart(Long userId, CartItemRequest request);

    CartResponse updateCartItem(Long userId, Long itemId, Integer quantity);

    CartResponse removeItemFromCart(Long userId, Long itemId);

    void clearCart(Long userId);
}
