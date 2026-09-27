package com.invoiceacumen.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponType discountType;

    @Column(nullable = false)
    private BigDecimal discountValue;

    // Order subtotal must be at least this amount for the coupon to apply
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    // Optional cap on discount amount, mainly useful for PERCENTAGE coupons
    private BigDecimal maxDiscountAmount;

    // Null means no expiry
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private boolean active = true;

    // Null means unlimited uses
    private Integer usageLimit;

    @Column(nullable = false)
    private Integer usedCount = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
