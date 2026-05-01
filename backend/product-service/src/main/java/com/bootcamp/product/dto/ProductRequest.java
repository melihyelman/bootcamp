package com.bootcamp.product.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Ürün adı boş bırakılamaz")
    private String name;

    private String description;

    @NotNull(message = "Fiyat boş bırakılamaz")
    @DecimalMin(value = "0.01", message = "Fiyat 0'dan büyük olmalıdır")
    private BigDecimal price;

    @NotNull(message = "Stok miktarı boş bırakılamaz")
    @Min(value = 0, message = "Stok miktarı negatif olamaz")
    private Integer stockQuantity;

    private String category;

    private String imageUrl;
}
