package com.bootcamp.order.service;

import com.bootcamp.order.dto.PaymentRequest;
import com.bootcamp.order.dto.PaymentResponse;

public interface PaymentService {

    PaymentResponse processPayment(Long userId, PaymentRequest request);
}
