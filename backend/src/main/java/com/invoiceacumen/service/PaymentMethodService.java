package com.invoiceacumen.service;

import com.invoiceacumen.entity.PaymentMethod;
import com.invoiceacumen.entity.User;
import com.invoiceacumen.exception.ApiException;
import com.invoiceacumen.repository.PaymentMethodRepository;
import com.invoiceacumen.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;
    private final UserRepository userRepository;

    public PaymentMethodService(PaymentMethodRepository paymentMethodRepository, UserRepository userRepository) {
        this.paymentMethodRepository = paymentMethodRepository;
        this.userRepository = userRepository;
    }

    public List<PaymentMethod> getUserPaymentMethods(Long userId) {
        return paymentMethodRepository.findByUserId(userId);
    }

    public PaymentMethod addPaymentMethod(Long userId, PaymentMethod method) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ApiException("User not found"));
        method.setUser(user);
        return paymentMethodRepository.save(method);
    }

    public void delete(Long userId, Long id) {
        PaymentMethod existing = paymentMethodRepository.findById(id).orElseThrow(() -> new ApiException("Payment method not found"));
        if (existing.getUser() == null || !existing.getUser().getId().equals(userId)) {
            throw new ApiException("You do not have access to this payment method");
        }
        paymentMethodRepository.deleteById(id);
    }
}
