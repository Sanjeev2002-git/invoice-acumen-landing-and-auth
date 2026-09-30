package com.invoiceacumen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ProfileSummary {
    private long totalOrders;
    private BigDecimal totalSpent;
    private LocalDateTime lastOrderDate;
}
