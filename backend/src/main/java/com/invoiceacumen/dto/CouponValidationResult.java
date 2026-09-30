package com.invoiceacumen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CouponValidationResult {
    private String code;
    private BigDecimal discountAmount;
    private BigDecimal newTotal;
}
