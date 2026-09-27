package com.invoiceacumen.job;

import com.invoiceacumen.entity.Product;
import com.invoiceacumen.repository.ProductRepository;
import com.invoiceacumen.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class LowStockAlertJob {

    @Autowired private ProductRepository productRepository;
    @Autowired private EmailService emailService;

    @Value("${app.admin-email:admin@example.com}")
    private String adminEmail;

    @Scheduled(cron = "0 0 8 * * *") // every day at 8 AM
    public void checkLowStock() {
        List<Product> lowStock = productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() != null
                        && p.getReorderThreshold() != null
                        && p.getStockQuantity() <= p.getReorderThreshold())
                .collect(Collectors.toList());

        if (lowStock.isEmpty()) return;

        String body = lowStock.stream()
                .map(p -> p.getName() + " — qty: " + p.getStockQuantity() + " (threshold: " + p.getReorderThreshold() + ")")
                .collect(Collectors.joining("\n"));

        emailService.send(adminEmail, "Low Stock Alert - " + lowStock.size() + " products", body);
    }
}
