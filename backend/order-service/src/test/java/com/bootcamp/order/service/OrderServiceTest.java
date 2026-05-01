package com.bootcamp.order.service;

import com.bootcamp.common.exception.BadRequestException;
import com.bootcamp.common.exception.ResourceNotFoundException;
import com.bootcamp.order.dto.OrderRequest;
import com.bootcamp.order.dto.OrderResponse;
import com.bootcamp.order.entity.*;
import com.bootcamp.order.repository.CartRepository;
import com.bootcamp.order.repository.OrderRepository;
import com.bootcamp.order.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartRepository cartRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Cart cart;
    private Order order;
    private OrderRequest orderRequest;

    @BeforeEach
    void setUp() {
        cart = Cart.builder()
                .id(1L)
                .userId(1L)
                .items(new ArrayList<>())
                .build();

        CartItem cartItem = CartItem.builder()
                .id(1L)
                .cart(cart)
                .productId(1L)
                .productName("Test Product")
                .price(BigDecimal.valueOf(99.99))
                .quantity(2)
                .build();
        cart.getItems().add(cartItem);

        order = Order.builder()
                .id(1L)
                .orderNumber("ORD-TEST1234")
                .userId(1L)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(199.98))
                .shippingAddress("Test Address")
                .items(new ArrayList<>())
                .build();

        orderRequest = new OrderRequest("Test Address");
    }

    @Test
    @DisplayName("Create Order - başarılı")
    void createOrder_Success() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderResponse response = orderService.createOrder(1L, orderRequest);

        assertThat(response).isNotNull();
        assertThat(response.getOrderNumber()).isEqualTo("ORD-TEST1234");
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Create Order - boş sepet")
    void createOrder_EmptyCart() {
        cart.getItems().clear();
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));

        assertThatThrownBy(() -> orderService.createOrder(1L, orderRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Sepet boş");
    }

    @Test
    @DisplayName("Create Order - sepet bulunamadı")
    void createOrder_CartNotFound() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(1L, orderRequest))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Get User Orders - başarılı")
    void getUserOrders_Success() {
        when(orderRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(order));

        List<OrderResponse> responses = orderService.getUserOrders(1L);

        assertThat(responses).hasSize(1);
    }

    @Test
    @DisplayName("Get Order By Id - başka kullanıcının siparişi")
    void getOrderById_WrongUser() {
        order.setUserId(2L);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.getOrderById(1L, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
