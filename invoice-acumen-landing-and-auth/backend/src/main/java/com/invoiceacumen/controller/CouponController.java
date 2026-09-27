package com.invoiceacumen.controller;

import com.invoiceacumen.dto.ApiResponse;
import com.invoiceacumen.dto.CouponValidationResult;
import com.invoiceacumen.dto.ValidateCouponRequest;
import com.invoiceacumen.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/validate")
    public ApiResponse<CouponValidationResult> validate(@Valid @RequestBody ValidateCouponRequest request) {
        CouponValidationResult result = couponService.validate(request.getCode(), request.getOrderTotal());
        return ApiResponse.ok("Coupon applied", result);
    }
}
