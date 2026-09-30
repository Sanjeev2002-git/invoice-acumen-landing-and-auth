package com.invoiceacumen.service;

import com.invoiceacumen.dto.RestockRequest;
import com.invoiceacumen.entity.Product;
import com.invoiceacumen.entity.StockTransaction;
import com.invoiceacumen.entity.StockTransactionType;
import com.invoiceacumen.exception.ApiException;
import com.invoiceacumen.repository.ProductRepository;
import com.invoiceacumen.repository.StockTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public ProductService(ProductRepository productRepository, StockTransactionRepository stockTransactionRepository) {
        this.productRepository = productRepository;
        this.stockTransactionRepository = stockTransactionRepository;
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product getById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new ApiException("Product not found"));
    }

    public Product create(Product product) {
        return productRepository.save(product);
    }

    public Product update(Long id, Product updated) {
        Product existing = getById(id);
        existing.setName(updated.getName());
        existing.setSku(updated.getSku());
        existing.setCategory(updated.getCategory());
        existing.setPrice(updated.getPrice());
        existing.setReorderThreshold(updated.getReorderThreshold());
        existing.setDescription(updated.getDescription());
        return productRepository.save(existing);
    }

    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    public List<Product> search(String name, String category, BigDecimal minPrice, BigDecimal maxPrice, boolean inStockOnly) {
        String normalizedName = (name == null || name.isBlank()) ? null : name.trim();
        String normalizedCategory = (category == null || category.isBlank()) ? null : category.trim();
        return productRepository.search(normalizedName, normalizedCategory, minPrice, maxPrice, inStockOnly);
    }

    public List<Product> lowStock() {
        return productRepository.findLowStock();
    }

    @Transactional
    public Product restock(Long productId, RestockRequest request) {
        Product product = productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new ApiException("Product not found"));
        product.setStockQuantity(product.getStockQuantity() + request.getQuantity());
        productRepository.save(product);

        StockTransaction txn = new StockTransaction();
        txn.setProduct(product);
        txn.setType(StockTransactionType.RESTOCK);
        txn.setQuantity(request.getQuantity());
        txn.setNote(request.getNote());
        stockTransactionRepository.save(txn);

        return product;
    }

    public void deductStock(Product product, int quantity, String note) {
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);

        StockTransaction txn = new StockTransaction();
        txn.setProduct(product);
        txn.setType(StockTransactionType.SALE);
        txn.setQuantity(quantity);
        txn.setNote(note);
        stockTransactionRepository.save(txn);
    }

    public void restoreStock(Long productId, int quantity, String note) {
        Product product = productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new ApiException("Product not found"));
        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);

        StockTransaction txn = new StockTransaction();
        txn.setProduct(product);
        txn.setType(StockTransactionType.ADJUSTMENT);
        txn.setQuantity(quantity);
        txn.setNote(note);
        stockTransactionRepository.save(txn);
    }
    public org.springframework.data.domain.Page<Product> searchPaged(
            String name, String category, BigDecimal minPrice, BigDecimal maxPrice,
            boolean inStockOnly, org.springframework.data.domain.Pageable pageable) {
        String normalizedName = (name == null || name.isBlank()) ? null : name.trim();
        String normalizedCategory = (category == null || category.isBlank()) ? null : category.trim();
        return productRepository.searchPaged(normalizedName, normalizedCategory, minPrice, maxPrice, inStockOnly, pageable);
    }
}
