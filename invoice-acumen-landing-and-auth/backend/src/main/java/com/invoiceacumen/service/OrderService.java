package com.invoiceacumen.service;

import com.invoiceacumen.dto.CreateOrderRequest;
import com.invoiceacumen.dto.OrderItemRequest;
import com.invoiceacumen.dto.OrderStatusUpdateRequest;
import com.invoiceacumen.dto.RevenueSummary;
import com.invoiceacumen.entity.*;
import com.invoiceacumen.exception.ApiException;
import com.invoiceacumen.repository.AddressRepository;
import com.invoiceacumen.repository.OrderRepository;
import com.invoiceacumen.repository.ProductRepository;
import com.invoiceacumen.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
public class OrderService {

    private static final BigDecimal GST_RATE = new BigDecimal("0.18");
    private static final BigDecimal DELIVERY_CHARGE = new BigDecimal("49.00");
    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("500.00");
    private static final int DELIVERY_LEAD_DAYS = 5;
    private static final DateTimeFormatter ORDER_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductService productService;
    private final CouponService couponService;
    private final NotificationService notificationService;
    @org.springframework.beans.factory.annotation.Autowired
    private OrderStatusValidator orderStatusValidator;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
                         UserRepository userRepository, AddressRepository addressRepository,
                         ProductService productService, CouponService couponService,
                         NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.productService = productService;
        this.couponService = couponService;
        this.notificationService = notificationService;
    }

    @Transactional
    public Order createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ApiException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(request.getPaymentMethod() == PaymentType.COD ? PaymentStatus.PENDING : PaymentStatus.PENDING);

        if (request.getAddressId() != null) {
            Address address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new ApiException("Address not found"));
            if (address.getUser() == null || !address.getUser().getId().equals(userId)) {
                throw new ApiException("You do not have access to this address");
            }
            order.setDeliveryAddress(address);
        }

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findByIdForUpdate(itemReq.getProductId())
                    .orElseThrow(() -> new ApiException("Product not found: " + itemReq.getProductId()));

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new ApiException("Insufficient stock for " + product.getName());
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(product.getPrice());
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            item.setSubtotal(subtotal);
            total = total.add(subtotal);

            order.getItems().add(item);

            productService.deductStock(product, itemReq.getQuantity(), "Order sale");
        }

        order.setSubtotalAmount(total);

        BigDecimal afterDiscount = total;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            BigDecimal discount = couponService.applyAndRecordUsage(request.getCouponCode(), total);
            order.setCouponCode(request.getCouponCode().trim().toUpperCase());
            order.setDiscountAmount(discount);
            afterDiscount = total.subtract(discount).max(BigDecimal.ZERO);
        }

        BigDecimal gst = afterDiscount.multiply(GST_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal deliveryCharge = afterDiscount.compareTo(FREE_DELIVERY_THRESHOLD) >= 0
                ? BigDecimal.ZERO
                : DELIVERY_CHARGE;

        order.setGstAmount(gst);
        order.setDeliveryCharge(deliveryCharge);
        order.setTotalAmount(afterDiscount.add(gst).add(deliveryCharge));
        order.setExpectedDeliveryDate(LocalDate.now().plusDays(DELIVERY_LEAD_DAYS));

        String sequence = nextDailySequence();
        order.setOrderNumber("ORD-" + LocalDate.now().format(ORDER_DATE_FORMAT) + "-" + sequence);
        order.setInvoiceNumber("INV-" + LocalDate.now().format(ORDER_DATE_FORMAT) + "-" + sequence);

        return orderRepository.save(order);
    }

    private String nextDailySequence() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        long countToday = orderRepository.countByOrderDateBetween(startOfDay, endOfDay);
        return String.format("%04d", countToday + 1);
    }

    @Transactional
    public Order cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ApiException("Order not found"));
        if (order.getUser() == null || !order.getUser().getId().equals(userId)) {
            throw new ApiException("You do not have access to this order");
        }
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new ApiException("Order can only be cancelled before it is packed for shipping");
        }
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                productService.restoreStock(item.getProduct().getId(), item.getQuantity(), "Order cancellation");
            }
        }
        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        notificationService.notifyOrderStatusChange(saved);
        return saved;
    }

    public List<Order> searchOrders(String query, OrderStatus status) {
        String normalized = (query == null || query.isBlank()) ? null : query.trim().toLowerCase();
        return orderRepository.search(normalized, status);
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllDetailed();
    }

    public Order updateStatus(Long orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ApiException("Order not found"));
        if (request.getStatus() != null) {
            orderStatusValidator.validateTransition(order.getStatus(), request.getStatus());
            order.setStatus(request.getStatus());
        }
        if (request.getPaymentStatus() != null) {
            order.setPaymentStatus(request.getPaymentStatus());
        }
        Order saved = orderRepository.save(order);
        notificationService.notifyOrderStatusChange(saved);
        return saved;
    }

    public Order getById(Long orderId) {
        return orderRepository.findDetailedById(orderId).orElseThrow(() -> new ApiException("Order not found"));
    }

    public RevenueSummary getRevenueSummary() {
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime weekStart = now.toLocalDate().with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime monthStart = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime yearStart = now.toLocalDate().withDayOfYear(1).atStartOfDay();

        BigDecimal weekly = sumRevenue(weekStart, now);
        BigDecimal monthly = sumRevenue(monthStart, now);
        BigDecimal yearly = sumRevenue(yearStart, now);

        return new RevenueSummary(weekly, monthly, yearly);
    }

    private BigDecimal sumRevenue(LocalDateTime start, LocalDateTime end) {
        List<Order> orders = orderRepository.findByOrderDateBetweenAndPaymentStatus(start, end, PaymentStatus.PAID);
        return orders.stream().map(Order::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}


