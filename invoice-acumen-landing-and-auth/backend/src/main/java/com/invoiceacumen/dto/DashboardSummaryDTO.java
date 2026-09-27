package com.invoiceacumen.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryDTO {

    private BigDecimal totalRevenue;
    private long totalOrders;
    private long lowStockCount;
    private long expiringCount;
    private List<TopProductDTO> topProducts;

    public DashboardSummaryDTO() {}

    public DashboardSummaryDTO(BigDecimal totalRevenue, long totalOrders, long lowStockCount,
                                long expiringCount, List<TopProductDTO> topProducts) {
        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.lowStockCount = lowStockCount;
        this.expiringCount = expiringCount;
        this.topProducts = topProducts;
    }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }

    public long getExpiringCount() { return expiringCount; }
    public void setExpiringCount(long expiringCount) { this.expiringCount = expiringCount; }

    public List<TopProductDTO> getTopProducts() { return topProducts; }
    public void setTopProducts(List<TopProductDTO> topProducts) { this.topProducts = topProducts; }

    public static class TopProductDTO {
        private String productName;
        private long unitsSold;

        public TopProductDTO() {}

        public TopProductDTO(String productName, long unitsSold) {
            this.productName = productName;
            this.unitsSold = unitsSold;
        }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public long getUnitsSold() { return unitsSold; }
        public void setUnitsSold(long unitsSold) { this.unitsSold = unitsSold; }
    }
}
