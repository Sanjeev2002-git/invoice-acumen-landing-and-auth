package com.invoiceacumen.dto;

import com.invoiceacumen.entity.CouponType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    @NotBlank(message = "Coupon code is required")
    private String code;
    @NotNull(message = "Discount type is required")
    private CouponType discountType;
    @NotNull(message = "Discount value is required")
    @Positive(message = "Discount value must be greater than zero")
    private BigDecimal discountValue;
    @DecimalMin(value = "0.00", message = "Minimum order amount cannot be negative")
    private BigDecimal minOrderAmount;
    @DecimalMin(value = "0.00", message = "Maximum discount amount cannot be negative")
    private BigDecimal maxDiscountAmount;
    private LocalDateTime expiryDate;
    private boolean active = true;
    @Positive(message = "Usage limit must be greater than zero")
    private Integer usageLimit;
}
