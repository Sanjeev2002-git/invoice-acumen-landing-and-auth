package com.invoiceacumen.service;

import com.invoiceacumen.dto.DashboardSummaryDTO;
import com.invoiceacumen.repository.OrderRepository;
import com.invoiceacumen.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * NOTE: This assumes:
 *  - OrderRepository has: sumTotalRevenue(), count(), and a top-selling-products
 *    query (findTopSellingProducts). These queries are NOT included here since
 *    they depend on your exact Order/OrderItem entity structure — you'll need
 *    to add matching @Query methods to OrderRepository. See
 *    OrderRepository_METHODS_TO_ADD.java for a starting point to adapt.
 */
@Service
public class DashboardService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryAlertService inventoryAlertService;

    public DashboardSummaryDTO getSummary() {
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        long totalOrders = orderRepository.count();
        long lowStockCount = inventoryAlertService.checkLowStock().size();
        long expiringCount = inventoryAlertService.checkExpiringProducts().size();

        List<DashboardSummaryDTO.TopProductDTO> topProducts = orderRepository.findTopSellingProducts()
                .stream()
                .limit(5)
                .map(row -> new DashboardSummaryDTO.TopProductDTO((String) row[0], (Long) row[1]))
                .toList();

        return new DashboardSummaryDTO(totalRevenue, totalOrders, lowStockCount, expiringCount, topProducts);
    }
}
