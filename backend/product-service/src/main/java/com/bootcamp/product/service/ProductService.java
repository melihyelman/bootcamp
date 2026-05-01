package com.bootcamp.product.service;

import com.bootcamp.common.dto.PagedResponse;
import com.bootcamp.product.dto.ProductRequest;
import com.bootcamp.product.dto.ProductResponse;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    ProductResponse getProductById(Long id);

    PagedResponse<ProductResponse> getAllProducts(int page, int size, String sortBy, String sortDir);

    PagedResponse<ProductResponse> getProductsByCategory(String category, int page, int size);

    PagedResponse<ProductResponse> searchProducts(String keyword, int page, int size);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    void decreaseStock(Long productId, Integer quantity);
}
