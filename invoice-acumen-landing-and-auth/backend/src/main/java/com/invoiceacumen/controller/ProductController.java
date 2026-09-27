package com.invoiceacumen.controller;

import com.invoiceacumen.dto.ApiResponse;
import com.invoiceacumen.dto.RatingSummary;
import com.invoiceacumen.entity.Product;
import com.invoiceacumen.entity.Review;
import com.invoiceacumen.service.ProductService;
import com.invoiceacumen.service.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final ReviewService reviewService;

    public ProductController(ProductService productService, ReviewService reviewService) {
        this.productService = productService;
        this.reviewService = reviewService;
    }

    @GetMapping
    public ApiResponse<List<Product>> getAll() {
        return ApiResponse.ok(productService.getAll());
    }

    @GetMapping("/search")
    public ApiResponse<List<Product>> search(@RequestParam(required = false) String name,
                                              @RequestParam(required = false) String category,
                                              @RequestParam(required = false) BigDecimal minPrice,
                                              @RequestParam(required = false) BigDecimal maxPrice,
                                              @RequestParam(defaultValue = "false") boolean inStockOnly) {
        return ApiResponse.ok(productService.search(name, category, minPrice, maxPrice, inStockOnly));
    }

    @GetMapping("/{id}")
    public ApiResponse<Product> getById(@PathVariable Long id) {
        return ApiResponse.ok(productService.getById(id));
    }

    @GetMapping("/{id}/reviews")
    public ApiResponse<List<Review>> getReviews(@PathVariable Long id) {
        return ApiResponse.ok(reviewService.getForProduct(id));
    }

    @GetMapping("/{id}/rating-summary")
    public ApiResponse<RatingSummary> getRatingSummary(@PathVariable Long id) {
        return ApiResponse.ok(reviewService.getRatingSummary(id));
    }

    @PostMapping
    public ApiResponse<Product> create(@RequestBody Product product) {
        return ApiResponse.ok("Product created", productService.create(product));
    }

    @PutMapping("/{id}")
    public ApiResponse<Product> update(@PathVariable Long id, @RequestBody Product product) {
        return ApiResponse.ok("Product updated", productService.update(id, product));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ApiResponse.ok("Product deleted", null);
    }
    @GetMapping("/search/paged")
    public ApiResponse<org.springframework.data.domain.Page<Product>> searchPaged(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "false") boolean inStockOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy) {
        org.springframework.data.domain.Pageable pageable =
            org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(sortBy));
        return ApiResponse.ok(productService.searchPaged(name, category, minPrice, maxPrice, inStockOnly, pageable));
    }
}
