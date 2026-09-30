package com.invoiceacumen.controller;

import com.invoiceacumen.dto.ApiResponse;
import com.invoiceacumen.dto.CouponRequest;
import com.invoiceacumen.dto.RestockRequest;
import com.invoiceacumen.dto.RevenueSummary;
import com.invoiceacumen.entity.Coupon;
import com.invoiceacumen.entity.Product;
import com.invoiceacumen.service.CouponService;
import com.invoiceacumen.service.OrderService;
import com.invoiceacumen.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final OrderService orderService;
    private final ProductService productService;
    private final CouponService couponService;

    public AdminController(OrderService orderService, ProductService productService, CouponService couponService) {
        this.orderService = orderService;
        this.productService = productService;
        this.couponService = couponService;
    }

    @GetMapping("/revenue")
    public ApiResponse<RevenueSummary> revenue() {
        return ApiResponse.ok(orderService.getRevenueSummary());
    }

    @GetMapping("/low-stock")
    public ApiResponse<List<Product>> lowStock() {
        return ApiResponse.ok(productService.lowStock());
    }

    @PatchMapping("/products/{id}/restock")
    public ApiResponse<Product> restock(@PathVariable Long id, @Valid @RequestBody RestockRequest request) {
        return ApiResponse.ok("Stock updated", productService.restock(id, request));
    }

    @GetMapping("/coupons")
    public ApiResponse<List<Coupon>> getCoupons() {
        return ApiResponse.ok(couponService.getAll());
    }

    @PostMapping("/coupons")
    public ApiResponse<Coupon> createCoupon(@Valid @RequestBody CouponRequest request) {
        return ApiResponse.ok("Coupon created", couponService.create(request));
    }

    @PutMapping("/coupons/{id}")
    public ApiResponse<Coupon> updateCoupon(@PathVariable Long id, @Valid @RequestBody CouponRequest request) {
        return ApiResponse.ok("Coupon updated", couponService.update(id, request));
    }

    @DeleteMapping("/coupons/{id}")
    public ApiResponse<Void> deleteCoupon(@PathVariable Long id) {
        couponService.delete(id);
        return ApiResponse.ok("Coupon deleted", null);
    }
}
