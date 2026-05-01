package com.bootcamp.order.service.impl;

import com.bootcamp.common.exception.ResourceNotFoundException;
import com.bootcamp.order.dto.CartItemRequest;
import com.bootcamp.order.dto.CartItemResponse;
import com.bootcamp.order.dto.CartResponse;
import com.bootcamp.order.entity.Cart;
import com.bootcamp.order.entity.CartItem;
import com.bootcamp.order.repository.CartRepository;
import com.bootcamp.order.service.CartService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private static final Logger log = LoggerFactory.getLogger(CartServiceImpl.class);

    private final CartRepository cartRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        log.debug("Getting cart for user: {}", userId);
        Cart cart = getOrCreateCart(userId);
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItemToCart(Long userId, CartItemRequest request) {
        log.info("Adding item to cart for user: {}, productId: {}", userId, request.getProductId());
        Cart cart = getOrCreateCart(userId);

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + request.getQuantity());
            existingItem.get().setPrice(request.getPrice());
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productId(request.getProductId())
                    .productName(request.getProductName())
                    .price(request.getPrice())
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
        }

        cart = cartRepository.save(cart);
        log.info("Item added to cart successfully for user: {}", userId);
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(Long userId, Long itemId, Integer quantity) {
        log.info("Updating cart item {} for user: {}", itemId, userId);
        Cart cart = getOrCreateCart(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Sepet öğesi", "id", itemId));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }

        cart = cartRepository.save(cart);
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeItemFromCart(Long userId, Long itemId) {
        log.info("Removing item {} from cart for user: {}", itemId, userId);
        Cart cart = getOrCreateCart(userId);

        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        cart = cartRepository.save(cart);

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        log.info("Clearing cart for user: {}", userId);
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().userId(userId).build();
                    return cartRepository.save(newCart);
                });
    }

    private CartResponse mapToCartResponse(Cart cart) {
        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .items(cart.getItems().stream()
                        .map(item -> CartItemResponse.builder()
                                .id(item.getId())
                                .productId(item.getProductId())
                                .productName(item.getProductName())
                                .price(item.getPrice())
                                .quantity(item.getQuantity())
                                .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                                .build())
                        .toList())
                .totalPrice(cart.getTotalPrice())
                .itemCount(cart.getItems().size())
                .build();
    }
}
