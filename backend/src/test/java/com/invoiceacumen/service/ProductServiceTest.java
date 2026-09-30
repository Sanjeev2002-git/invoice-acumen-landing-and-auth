package com.invoiceacumen.service;

import com.invoiceacumen.entity.Product;
import com.invoiceacumen.repository.ProductRepository;
import com.invoiceacumen.repository.StockTransactionRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProductServiceTest {

    @Test
    void queriesLowStockInTheDatabaseInsteadOfLoadingEveryProduct() {
        ProductRepository productRepository = mock(ProductRepository.class);
        StockTransactionRepository stockTransactionRepository = mock(StockTransactionRepository.class);
        ProductService service = new ProductService(productRepository, stockTransactionRepository);
        Product product = new Product();
        when(productRepository.findLowStock()).thenReturn(List.of(product));

        assertEquals(List.of(product), service.lowStock());
        verify(productRepository).findLowStock();
    }
}
