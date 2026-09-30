package com.invoiceacumen.controller;

import com.invoiceacumen.dto.ApiResponse;
import com.invoiceacumen.entity.PaymentMethod;
import com.invoiceacumen.security.JwtUtil;
import com.invoiceacumen.service.PaymentMethodService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-methods")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;
    private final JwtUtil jwtUtil;

    public PaymentMethodController(PaymentMethodService paymentMethodService, JwtUtil jwtUtil) {
        this.paymentMethodService = paymentMethodService;
        this.jwtUtil = jwtUtil;
    }

    private Long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    @GetMapping
    public ApiResponse<List<PaymentMethod>> getMine(HttpServletRequest request) {
        return ApiResponse.ok(paymentMethodService.getUserPaymentMethods(extractUserId(request)));
    }

    @PostMapping
    public ApiResponse<PaymentMethod> add(@RequestBody PaymentMethod method, HttpServletRequest request) {
        return ApiResponse.ok("Payment method added", paymentMethodService.addPaymentMethod(extractUserId(request), method));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        paymentMethodService.delete(extractUserId(request), id);
        return ApiResponse.ok("Payment method deleted", null);
    }
}
