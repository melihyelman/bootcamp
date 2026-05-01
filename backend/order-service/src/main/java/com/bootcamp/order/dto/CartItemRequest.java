package com.bootcamp.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequest {

    @NotNull(message = "Ürün ID boş bırakılamaz")
    private Long productId;

    @NotNull(message = "Ürün adı boş bırakılamaz")
    private String productName;

    @NotNull(message = "Fiyat boş bırakılamaz")
    private BigDecimal price;

    @NotNull(message = "Miktar boş bırakılamaz")
    @Min(value = 1, message = "Miktar en az 1 olmalıdır")
    private Integer quantity;
}
