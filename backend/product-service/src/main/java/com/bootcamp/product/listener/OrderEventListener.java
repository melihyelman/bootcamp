package com.bootcamp.product.listener;

import com.bootcamp.common.event.OrderCreatedEvent;
import com.bootcamp.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private static final Logger log = LoggerFactory.getLogger(OrderEventListener.class);
    private final ProductService productService;

    @RabbitListener(queues = "${rabbitmq.queue.order.created:order_created_queue}")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received OrderCreatedEvent for order: {}", event.getOrderNumber());
        try {
            event.getItems().forEach(item -> {
                log.info("Deducting {} from product ID {}", item.getQuantity(), item.getProductId());
                productService.decreaseStock(item.getProductId(), item.getQuantity());
            });
        } catch (Exception e) {
            log.error("Failed to process OrderCreatedEvent for order: {}", event.getOrderNumber(), e);
        }
    }
}
