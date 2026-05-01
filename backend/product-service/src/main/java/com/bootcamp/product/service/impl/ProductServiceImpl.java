package com.bootcamp.product.service.impl;

import com.bootcamp.common.dto.PagedResponse;
import com.bootcamp.common.exception.ResourceNotFoundException;
import com.bootcamp.product.dto.ProductRequest;
import com.bootcamp.product.dto.ProductResponse;
import com.bootcamp.product.entity.Product;
import com.bootcamp.product.mapper.ProductMapper;
import com.bootcamp.product.repository.ProductRepository;
import com.bootcamp.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        log.info("Creating product: {}", request.getName());
        Product product = productMapper.toEntity(request);
        product = productRepository.save(product);
        log.info("Product created with id: {}", product.getId());
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        log.debug("Fetching product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün", "id", id));
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getAllProducts(int page, int size, String sortBy, String sortDir) {
        log.debug("Fetching products - page: {}, size: {}, sortBy: {}", page, size, sortBy);

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepository.findByActiveTrue(pageable);

        return buildPagedResponse(productPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getProductsByCategory(String category, int page, int size) {
        log.debug("Fetching products by category: {}", category);
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.findByCategoryAndActiveTrue(category, pageable);
        return buildPagedResponse(productPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> searchProducts(String keyword, int page, int size) {
        log.debug("Searching products with keyword: {}", keyword);
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.searchProducts(keyword, pageable);
        return buildPagedResponse(productPage);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        log.info("Updating product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün", "id", id));

        productMapper.updateEntity(product, request);
        product = productRepository.save(product);
        log.info("Product updated: {}", product.getId());
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        log.info("Soft deleting product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün", "id", id));

        product.setActive(false);
        productRepository.save(product);
        log.info("Product soft deleted: {}", id);
    }

    @Override
    @Transactional
    public void decreaseStock(Long productId, Integer quantity) {
        log.info("Decreasing stock for product id: {} by {}", productId, quantity);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün", "id", productId));

        if (product.getStock() < quantity) {
            throw new com.bootcamp.common.exception.BadRequestException("Yetersiz stok: " + product.getName());
        }

        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
        log.info("Stock updated for product id: {}, new stock: {}", productId, product.getStock());
    }

    private PagedResponse<ProductResponse> buildPagedResponse(Page<Product> productPage) {
        List<ProductResponse> content = productPage.getContent()
                .stream()
                .map(productMapper::toResponse)
                .toList();

        return PagedResponse.<ProductResponse>builder()
                .content(content)
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }
}
