package com.invoiceacumen.dto;

import com.invoiceacumen.entity.OrderStatus;
import com.invoiceacumen.entity.PaymentStatus;
import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    private OrderStatus status;
    private PaymentStatus paymentStatus;
}
