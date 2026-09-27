package com.invoiceacumen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class RevenueSummary {
    private BigDecimal weekly;
    private BigDecimal monthly;
    private BigDecimal yearly;
}
