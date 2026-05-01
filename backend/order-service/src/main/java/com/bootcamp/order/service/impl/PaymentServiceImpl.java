package com.bootcamp.order.service.impl;

import com.bootcamp.common.exception.BadRequestException;
import com.bootcamp.common.exception.ResourceNotFoundException;
import com.bootcamp.order.dto.PaymentRequest;
import com.bootcamp.order.dto.PaymentResponse;
import com.bootcamp.order.entity.Order;
import com.bootcamp.order.entity.OrderStatus;
import com.bootcamp.order.repository.OrderRepository;
import com.bootcamp.order.service.PaymentService;
import com.iyzipay.Options;
import com.iyzipay.model.*;
import com.iyzipay.request.CreatePaymentRequest;
import com.bootcamp.common.event.OrderCreatedEvent;
import com.bootcamp.common.event.OrderItemEventDto;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final OrderRepository orderRepository;
    private final org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate;

    @Value("${iyzico.api-key}")
    private String apiKey;

    @Value("${iyzico.secret-key}")
    private String secretKey;

    @Value("${iyzico.base-url}")
    private String baseUrl;

    @Value("${rabbitmq.exchange.name:ecommerce_exchange}")
    private String exchangeName;

    @Value("${rabbitmq.routing.order.created:order.created}")
    private String orderCreatedRoutingKey;

    @Override
    @Transactional
    public PaymentResponse processPayment(Long userId, PaymentRequest request) {
        log.info("Processing payment for order: {}", request.getOrderNumber());

        Order order = orderRepository.findByOrderNumber(request.getOrderNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş", "orderNumber", request.getOrderNumber()));

        if (!order.getUserId().equals(userId)) {
            throw new BadRequestException("Bu sipariş size ait değil");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Bu sipariş için ödeme yapılamaz. Durum: " + order.getStatus());
        }

        order.setStatus(OrderStatus.PAYMENT_PROCESSING);
        orderRepository.save(order);

        try {
            Options options = new Options();
            options.setApiKey(apiKey);
            options.setSecretKey(secretKey);
            options.setBaseUrl(baseUrl);

            CreatePaymentRequest paymentRequest = new CreatePaymentRequest();
            paymentRequest.setLocale(Locale.TR.getValue());
            paymentRequest.setConversationId(order.getOrderNumber());
            paymentRequest.setPrice(order.getTotalAmount());
            paymentRequest.setPaidPrice(order.getTotalAmount());
            paymentRequest.setCurrency(Currency.TRY.name());
            paymentRequest.setInstallment(1);
            paymentRequest.setBasketId(order.getOrderNumber());
            paymentRequest.setPaymentChannel(PaymentChannel.WEB.name());
            paymentRequest.setPaymentGroup(PaymentGroup.PRODUCT.name());

            PaymentCard paymentCard = new PaymentCard();
            paymentCard.setCardHolderName(request.getCardHolderName());
            paymentCard.setCardNumber(request.getCardNumber());
            paymentCard.setExpireMonth(request.getExpireMonth());
            paymentCard.setExpireYear(request.getExpireYear());
            paymentCard.setCvc(request.getCvc());
            paymentCard.setRegisterCard(0);
            paymentRequest.setPaymentCard(paymentCard);

            Buyer buyer = new Buyer();
            buyer.setId(userId.toString());
            buyer.setName(request.getBuyerName());
            buyer.setSurname(request.getBuyerSurname());
            buyer.setEmail(request.getBuyerEmail());
            buyer.setIdentityNumber(request.getBuyerIdentityNumber());
            buyer.setRegistrationAddress(order.getShippingAddress());
            buyer.setCity(request.getBuyerCity());
            buyer.setCountry(request.getBuyerCountry());
            paymentRequest.setBuyer(buyer);

            Address shippingAddress = new Address();
            shippingAddress.setContactName(request.getBuyerName() + " " + request.getBuyerSurname());
            shippingAddress.setCity(request.getBuyerCity());
            shippingAddress.setCountry(request.getBuyerCountry());
            shippingAddress.setAddress(order.getShippingAddress());
            paymentRequest.setShippingAddress(shippingAddress);
            paymentRequest.setBillingAddress(shippingAddress);

            List<BasketItem> basketItems = new ArrayList<>();
            order.getItems().forEach(item -> {
                BasketItem basketItem = new BasketItem();
                basketItem.setId(item.getProductId().toString());
                basketItem.setName(item.getProductName());
                basketItem.setCategory1("Products");
                basketItem.setItemType(BasketItemType.PHYSICAL.name());
                basketItem.setPrice(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                basketItems.add(basketItem);
            });
            paymentRequest.setBasketItems(basketItems);

            Payment payment = Payment.create(paymentRequest, options);

            if (payment.getStatus().equals("success")) {
                order.setStatus(OrderStatus.PAID);
                order.setPaymentId(payment.getPaymentId());
                orderRepository.save(order);

                log.info("Payment successful for order: {}", order.getOrderNumber());

                // Publish event to RabbitMQ
                List<OrderItemEventDto> eventItems = order.getItems().stream()
                        .map(item -> new OrderItemEventDto(item.getProductId(), item.getQuantity()))
                        .toList();

                OrderCreatedEvent event = new OrderCreatedEvent(
                        order.getOrderNumber(),
                        userId,
                        eventItems
                );
                rabbitTemplate.convertAndSend(exchangeName, orderCreatedRoutingKey, event);
                log.info("Published OrderCreatedEvent for order: {}", order.getOrderNumber());

                return PaymentResponse.builder()
                        .paymentId(payment.getPaymentId())
                        .status("SUCCESS")
                        .paidPrice(order.getTotalAmount())
                        .orderNumber(order.getOrderNumber())
                        .build();
            } else {
                order.setStatus(OrderStatus.PENDING);
                orderRepository.save(order);

                log.error("Payment failed for order: {}. Error: {}", order.getOrderNumber(), payment.getErrorMessage());
                throw new BadRequestException("Ödeme başarısız: " + payment.getErrorMessage());
            }

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            order.setStatus(OrderStatus.PENDING);
            orderRepository.save(order);

            log.error("Payment error for order: {}", order.getOrderNumber(), e);
            throw new BadRequestException("Ödeme işlemi sırasında hata oluştu: " + e.getMessage());
        }
    }
}
