package com.invoiceacumen.service;

import com.invoiceacumen.entity.Notification;
import com.invoiceacumen.entity.Product;
import com.invoiceacumen.repository.NotificationRepository;
import com.invoiceacumen.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Runs daily: flags products expiring within 30 days and products at/below
 * their reorder threshold. Creates Notification entries for each.
 *
 * NOTE: Assumes Notification entity has fields: message (String), type (String),
 * isRead (boolean), createdAt (LocalDateTime) or similar — adjust the
 * buildNotification() calls below to match your actual Notification entity.
 */
@Service
public class InventoryAlertService {

    private static final Logger log = LoggerFactory.getLogger(InventoryAlertService.class);
    private static final int EXPIRY_WARNING_DAYS = 30;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // Runs every day at 6 AM. Change cron as needed.
    @Scheduled(cron = "0 0 6 * * *")
    public void runDailyChecks() {
        checkExpiringProducts();
        checkLowStock();
    }

    public List<Product> checkExpiringProducts() {
        LocalDate cutoff = LocalDate.now().plusDays(EXPIRY_WARNING_DAYS);
        List<Product> expiring = productRepository.findByExpiryDateBefore(cutoff);

        for (Product p : expiring) {
            String msg = String.format("%s (batch: %s) expires on %s",
                    p.getName(),
                    p.getBatchNumber() != null ? p.getBatchNumber() : "N/A",
                    p.getExpiryDate());
            createNotification(msg, "EXPIRY_WARNING");
        }

        log.info("Expiry check: {} product(s) expiring within {} days", expiring.size(), EXPIRY_WARNING_DAYS);
        return expiring;
    }

    public List<Product> checkLowStock() {
        List<Product> lowStock = productRepository.findLowStock();

        for (Product p : lowStock) {
            String msg = String.format("%s is low on stock: %d units remaining (threshold: %d)",
                    p.getName(), p.getStockQuantity(), p.getReorderThreshold());
            createNotification(msg, "LOW_STOCK");
        }

        log.info("Low stock check: {} product(s) at or below reorder threshold", lowStock.size());
        return lowStock;
    }

    private void createNotification(String message, String type) {
        Notification n = new Notification();
        n.setMessage(message);
        n.setTitle(type);
        n.setRead(false);
        notificationRepository.save(n);
    }
}

