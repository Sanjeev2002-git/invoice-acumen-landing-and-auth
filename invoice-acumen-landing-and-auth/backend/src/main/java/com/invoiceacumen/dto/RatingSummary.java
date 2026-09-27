package com.invoiceacumen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RatingSummary {
    private double averageRating;
    private long reviewCount;
}
