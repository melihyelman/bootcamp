package com.bootcamp.product.service;

import com.bootcamp.common.dto.PagedResponse;
import com.bootcamp.common.exception.ResourceNotFoundException;
import com.bootcamp.product.dto.ProductRequest;
import com.bootcamp.product.dto.ProductResponse;
import com.bootcamp.product.entity.Product;
import com.bootcamp.product.mapper.ProductMapper;
import com.bootcamp.product.repository.ProductRepository;
import com.bootcamp.product.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product product;
    private ProductRequest productRequest;
    private ProductResponse productResponse;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .id(1L)
                .name("Test Product")
                .description("Test Description")
                .price(BigDecimal.valueOf(99.99))
                .stockQuantity(10)
                .category("Elektronik")
                .active(true)
                .build();

        productRequest = new ProductRequest("Test Product", "Test Description",
                BigDecimal.valueOf(99.99), 10, "Elektronik", null);

        productResponse = ProductResponse.builder()
                .id(1L)
                .name("Test Product")
                .description("Test Description")
                .price(BigDecimal.valueOf(99.99))
                .stockQuantity(10)
                .category("Elektronik")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Create Product - başarılı")
    void createProduct_Success() {
        when(productMapper.toEntity(any())).thenReturn(product);
        when(productRepository.save(any())).thenReturn(product);
        when(productMapper.toResponse(any())).thenReturn(productResponse);

        ProductResponse result = productService.createProduct(productRequest);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Test Product");
        verify(productRepository).save(any());
    }

    @Test
    @DisplayName("Get Product By Id - başarılı")
    void getProductById_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productMapper.toResponse(product)).thenReturn(productResponse);

        ProductResponse result = productService.getProductById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Get Product By Id - bulunamadı")
    void getProductById_NotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Get All Products - sayfalama")
    void getAllProducts_WithPagination() {
        Page<Product> page = new PageImpl<>(List.of(product));
        when(productRepository.findByActiveTrue(any(Pageable.class))).thenReturn(page);
        when(productMapper.toResponse(product)).thenReturn(productResponse);

        PagedResponse<ProductResponse> result = productService.getAllProducts(0, 10, "id", "asc");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("Delete Product - soft delete")
    void deleteProduct_SoftDelete() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        productService.deleteProduct(1L);

        assertThat(product.getActive()).isFalse();
        verify(productRepository).save(product);
    }

    @Test
    @DisplayName("Update Product - başarılı")
    void updateProduct_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenReturn(product);
        when(productMapper.toResponse(any())).thenReturn(productResponse);

        ProductResponse result = productService.updateProduct(1L, productRequest);

        assertThat(result).isNotNull();
        verify(productMapper).updateEntity(product, productRequest);
        verify(productRepository).save(product);
    }
}
