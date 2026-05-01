package com.bootcamp.order.service.impl;

import com.bootcamp.common.exception.BadRequestException;
import com.bootcamp.common.exception.ResourceNotFoundException;
import com.bootcamp.order.dto.OrderItemResponse;
import com.bootcamp.order.dto.OrderRequest;
import com.bootcamp.order.dto.OrderResponse;
import com.bootcamp.order.entity.*;
import com.bootcamp.order.repository.CartRepository;
import com.bootcamp.order.repository.OrderRepository;
import com.bootcamp.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(Long userId, OrderRequest request) {
        log.info("Creating order for user: {}", userId);

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Sepet bulunamadı"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Sepet boş, sipariş oluşturulamaz");
        }

        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .userId(userId)
                .status(OrderStatus.PENDING)
                .totalAmount(cart.getTotalPrice())
                .shippingAddress(request.getShippingAddress())
                .build();

        List<OrderItem> orderItems = cart.getItems().stream()
                .map(cartItem -> OrderItem.builder()
                        .order(order)
                        .productId(cartItem.getProductId())
                        .productName(cartItem.getProductName())
                        .price(cartItem.getPrice())
                        .quantity(cartItem.getQuantity())
                        .build())
                .toList();

        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        log.info("Order created: {} for user: {}", orderNumber, userId);
        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş", "id", orderId));

        if (!order.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Sipariş", "id", orderId);
        }

        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş", "orderNumber", orderNumber));
        return mapToOrderResponse(order);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .paymentId(order.getPaymentId())
                .items(order.getItems().stream()
                        .map(item -> OrderItemResponse.builder()
                                .id(item.getId())
                                .productId(item.getProductId())
                                .productName(item.getProductName())
                                .price(item.getPrice())
                                .quantity(item.getQuantity())
                                .build())
                        .toList())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
