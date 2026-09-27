package com.invoiceacumen.repository;

import com.invoiceacumen.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    List<StockTransaction> findByProductIdOrderByTimestampDesc(Long productId);
}
