package com.invoiceacumen.service;

import com.invoiceacumen.entity.Coupon;
import com.invoiceacumen.entity.CouponType;
import com.invoiceacumen.repository.CouponRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CouponServiceTest {

    @Test
    void locksCouponBeforeRecordingUsage() {
        CouponRepository repository = mock(CouponRepository.class);
        CouponService service = new CouponService(repository);
        Coupon coupon = new Coupon();
        coupon.setCode("SAVE10");
        coupon.setDiscountType(CouponType.PERCENTAGE);
        coupon.setDiscountValue(new BigDecimal("10"));
        coupon.setMinOrderAmount(BigDecimal.ZERO);
        coupon.setUsedCount(0);
        when(repository.findByCodeIgnoreCaseForUpdate("SAVE10")).thenReturn(Optional.of(coupon));

        BigDecimal discount = service.applyAndRecordUsage("SAVE10", new BigDecimal("100.00"));

        assertEquals(new BigDecimal("10.00"), discount);
        assertEquals(1, coupon.getUsedCount());
        verify(repository).findByCodeIgnoreCaseForUpdate("SAVE10");
        verify(repository).save(coupon);
    }
}
