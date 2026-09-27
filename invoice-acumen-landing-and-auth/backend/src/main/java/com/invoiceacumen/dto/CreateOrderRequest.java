package com.invoiceacumen.dto;

import com.invoiceacumen.entity.PaymentType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequest> items;
    private Long addressId;
    @NotNull(message = "Payment method is required")
    private PaymentType paymentMethod;
    private String couponCode;
}
