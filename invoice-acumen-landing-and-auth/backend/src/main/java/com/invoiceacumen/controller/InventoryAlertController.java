package com.invoiceacumen.controller;

import com.invoiceacumen.entity.Product;
import com.invoiceacumen.service.InventoryAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryAlertController {

    @Autowired
    private InventoryAlertService inventoryAlertService;

    @GetMapping("/expiring")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    public List<Product> getExpiringProducts() {
        return inventoryAlertService.checkExpiringProducts();
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    public List<Product> getLowStockProducts() {
        return inventoryAlertService.checkLowStock();
    }

    // Manual trigger, useful for testing without waiting for the cron
    @PostMapping("/run-checks")
    @PreAuthorize("hasRole('ADMIN')")
    public String runChecksNow() {
        inventoryAlertService.runDailyChecks();
        return "Inventory checks completed";
    }
}
