package com.invoiceacumen.dto;

import com.invoiceacumen.entity.PaymentType;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CreateOrderRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void rejectsAnEmptyOrder() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setItems(List.of());
        request.setPaymentMethod(PaymentType.COD);

        assertTrue(validator.validate(request).stream()
                .anyMatch(violation -> violation.getPropertyPath().toString().equals("items")));
    }

    @Test
    void rejectsNonPositiveItemQuantity() {
        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(4L);
        item.setQuantity(0);
        CreateOrderRequest request = new CreateOrderRequest();
        request.setItems(List.of(item));
        request.setPaymentMethod(PaymentType.COD);

        assertEquals(1, validator.validate(request).size());
    }
}
