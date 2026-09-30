package com.invoiceacumen.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ValidateCouponRequest {
    @NotBlank(message = "Coupon code is required")
    private String code;
    @NotNull(message = "Order total is required")
    @DecimalMin(value = "0.00", message = "Order total cannot be negative")
    private BigDecimal orderTotal;
}
