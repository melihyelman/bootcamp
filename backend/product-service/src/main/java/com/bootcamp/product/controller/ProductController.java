package com.bootcamp.product.controller;

import com.bootcamp.common.dto.ApiResponse;
import com.bootcamp.common.dto.PagedResponse;
import com.bootcamp.product.dto.ProductRequest;
import com.bootcamp.product.dto.ProductResponse;
import com.bootcamp.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Ürün yönetimi işlemleri")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Ürün oluştur", description = "Yeni ürün ekler (Admin)")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ürün oluşturuldu", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Ürün detay", description = "ID ile ürün bilgisini getirir")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(@PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Ürün listele", description = "Sayfalanmış ürün listesi döner")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PagedResponse<ProductResponse> response = productService.getAllProducts(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @Operation(summary = "Ürün ara", description = "Anahtar kelime ile ürün arar")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ProductResponse> response = productService.searchProducts(keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Kategoriye göre listele", description = "Belirtilen kategorideki ürünleri listeler")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ProductResponse> response = productService.getProductsByCategory(category, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Ürün güncelle", description = "Mevcut ürünü günceller (Admin)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Ürün güncellendi", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Ürün sil", description = "Ürünü soft delete ile siler (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Ürün silindi", null));
    }
}
