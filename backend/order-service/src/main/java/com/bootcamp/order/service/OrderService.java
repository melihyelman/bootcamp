package com.bootcamp.order.service;

import com.bootcamp.order.dto.OrderRequest;
import com.bootcamp.order.dto.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(Long userId, OrderRequest request);

    OrderResponse getOrderById(Long userId, Long orderId);

    List<OrderResponse> getUserOrders(Long userId);

    OrderResponse getOrderByNumber(String orderNumber);
}
