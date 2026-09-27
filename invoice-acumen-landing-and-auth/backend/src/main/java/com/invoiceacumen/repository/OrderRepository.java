package com.invoiceacumen.repository;

import com.invoiceacumen.entity.Order;
import com.invoiceacumen.entity.OrderStatus;
import com.invoiceacumen.entity.PaymentStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.math.BigDecimal;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"user", "deliveryAddress", "items", "items.product"})
    List<Order> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"user", "deliveryAddress", "items", "items.product"})
    @Query("select o from Order o where o.id = :id")
    java.util.Optional<Order> findDetailedById(@Param("id") Long id);

    @EntityGraph(attributePaths = {"user", "deliveryAddress", "items", "items.product"})
    @Query("select o from Order o")
    List<Order> findAllDetailed();

    List<Order> findByOrderDateBetweenAndPaymentStatus(LocalDateTime start, LocalDateTime end, PaymentStatus status);
    long countByOrderDateBetween(LocalDateTime start, LocalDateTime end);

    @EntityGraph(attributePaths = {"user", "deliveryAddress", "items", "items.product"})
    @Query("select o from Order o where " +
            "(:q is null or lower(o.orderNumber) like concat('%', :q, '%') " +
            "or lower(o.user.name) like concat('%', :q, '%') " +
            "or o.user.phone like concat('%', :q, '%')) " +
            "and (:status is null or o.status = :status) " +
            "order by o.orderDate desc")
    List<Order> search(@Param("q") String q, @Param("status") OrderStatus status);
    @Query("select coalesce(sum(o.totalAmount), 0) from Order o")
    BigDecimal sumTotalRevenue();

    @Query("select p.name, sum(oi.quantity) from Order o join o.items oi join oi.product p group by p.id, p.name order by sum(oi.quantity) desc")
    List<Object[]> findTopSellingProducts();
}

