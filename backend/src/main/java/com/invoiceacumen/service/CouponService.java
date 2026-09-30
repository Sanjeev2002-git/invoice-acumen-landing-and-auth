package com.invoiceacumen.service;

import com.invoiceacumen.dto.CouponRequest;
import com.invoiceacumen.dto.CouponValidationResult;
import com.invoiceacumen.entity.Coupon;
import com.invoiceacumen.entity.CouponType;
import com.invoiceacumen.exception.ApiException;
import com.invoiceacumen.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public List<Coupon> getAll() {
        return couponRepository.findAll();
    }

    public Coupon create(CouponRequest request) {
        if (couponRepository.findByCodeIgnoreCase(request.getCode()).isPresent()) {
            throw new ApiException("A coupon with this code already exists");
        }
        Coupon coupon = new Coupon();
        applyRequest(coupon, request);
        return couponRepository.save(coupon);
    }

    public Coupon update(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ApiException("Coupon not found"));
        applyRequest(coupon, request);
        return couponRepository.save(coupon);
    }

    public void delete(Long id) {
        couponRepository.deleteById(id);
    }

    private void applyRequest(Coupon coupon, CouponRequest request) {
        coupon.setCode(request.getCode().trim().toUpperCase());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setActive(request.isActive());
        coupon.setUsageLimit(request.getUsageLimit());
    }

    /**
     * Validates a coupon against an order total and returns the discount that would apply,
     * without recording usage. Used by the cart page before an order is placed.
     */
    public CouponValidationResult validate(String code, BigDecimal orderTotal) {
        Coupon coupon = getActiveCoupon(code, orderTotal);
        BigDecimal discount = computeDiscount(coupon, orderTotal);
        BigDecimal newTotal = orderTotal.subtract(discount).max(BigDecimal.ZERO);
        return new CouponValidationResult(coupon.getCode(), discount, newTotal);
    }

    /**
     * Validates and atomically records a use of the coupon. Called during order creation.
     */
    public BigDecimal applyAndRecordUsage(String code, BigDecimal orderTotal) {
        Coupon coupon = getActiveCouponForUpdate(code, orderTotal);
        BigDecimal discount = computeDiscount(coupon, orderTotal);
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
        return discount;
    }

    private Coupon getActiveCoupon(String code, BigDecimal orderTotal) {
        String normalizedCode = normalizeCode(code);
        return validateCoupon(couponRepository.findByCodeIgnoreCase(normalizedCode), normalizedCode, orderTotal);
    }

    private Coupon getActiveCouponForUpdate(String code, BigDecimal orderTotal) {
        String normalizedCode = normalizeCode(code);
        return validateCoupon(couponRepository.findByCodeIgnoreCaseForUpdate(normalizedCode), normalizedCode, orderTotal);
    }

    private String normalizeCode(String code) {
        if (code == null || code.isBlank()) {
            throw new ApiException("Coupon code is required");
        }
        return code.trim();
    }

    private Coupon validateCoupon(java.util.Optional<Coupon> couponResult, String code, BigDecimal orderTotal) {
        Coupon coupon = couponResult
                .orElseThrow(() -> new ApiException("Invalid coupon code"));

        if (!coupon.isActive()) {
            throw new ApiException("This coupon is no longer active");
        }
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ApiException("This coupon has expired");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new ApiException("This coupon has reached its usage limit");
        }
        if (orderTotal == null || orderTotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new ApiException("Order total must be at least " + coupon.getMinOrderAmount() + " to use this coupon");
        }
        return coupon;
    }

    private BigDecimal computeDiscount(Coupon coupon, BigDecimal orderTotal) {
        BigDecimal discount;
        if (coupon.getDiscountType() == CouponType.PERCENTAGE) {
            discount = orderTotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = coupon.getDiscountValue();
        }
        if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
            discount = coupon.getMaxDiscountAmount();
        }
        if (discount.compareTo(orderTotal) > 0) {
            discount = orderTotal;
        }
        return discount;
    }
}
