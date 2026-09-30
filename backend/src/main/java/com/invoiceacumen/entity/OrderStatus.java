package com.invoiceacumen.entity;

public enum OrderStatus {
    PENDING,          // Order Placed
    CONFIRMED,
    PACKED,
    SHIPPED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}
