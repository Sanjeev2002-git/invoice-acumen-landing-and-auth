package com.invoiceacumen.controller;

import com.invoiceacumen.dto.ApiResponse;
import com.invoiceacumen.dto.CreateOrderRequest;
import com.invoiceacumen.dto.OrderStatusUpdateRequest;
import com.invoiceacumen.entity.Order;
import com.invoiceacumen.exception.ApiException;
import com.invoiceacumen.service.InvoiceService;
import com.invoiceacumen.service.OrderService;
import com.invoiceacumen.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;
    private final InvoiceService invoiceService;

    public OrderController(OrderService orderService, UserService userService, InvoiceService invoiceService) {
        this.orderService = orderService;
        this.userService = userService;
        this.invoiceService = invoiceService;
    }

    private Long extractUserId(Authentication authentication) {
        return userService.getIdByEmail(authentication.getName());
    }

    private String extractRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse(null);
    }

    @PostMapping
    public ApiResponse<Order> createOrder(@Valid @RequestBody CreateOrderRequest orderRequest, Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ApiResponse.ok("Order placed successfully", orderService.createOrder(userId, orderRequest));
    }

    @GetMapping("/my")
    public ApiResponse<List<Order>> myOrders(Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ApiResponse.ok(orderService.getUserOrders(userId));
    }

    @GetMapping
    public ApiResponse<List<Order>> allOrders() {
        return ApiResponse.ok(orderService.getAllOrders());
    }

    @GetMapping("/search")
    public ApiResponse<List<Order>> search(@RequestParam(required = false) String q,
                                            @RequestParam(required = false) com.invoiceacumen.entity.OrderStatus status) {
        return ApiResponse.ok(orderService.searchOrders(q, status));
    }

    @GetMapping("/{id}")
    public ApiResponse<Order> getOne(@PathVariable Long id, Authentication authentication) {
        Order order = orderService.getById(id);
        Long userId = extractUserId(authentication);
        String role = extractRole(authentication);
        boolean isOwner = order.getUser() != null && order.getUser().getId().equals(userId);
        if (!isOwner && !"ADMIN".equals(role)) {
            throw new ApiException("You do not have access to this order");
        }
        return ApiResponse.ok(order);
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<Order> updateStatus(@PathVariable Long id, @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ApiResponse.ok("Order status updated", orderService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/cancel")
    public ApiResponse<Order> cancel(@PathVariable Long id, Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ApiResponse.ok("Order cancelled", orderService.cancelOrder(userId, id));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id, Authentication authentication) throws IOException {
        Order order = orderService.getById(id);

        Long userId = extractUserId(authentication);
        String role = extractRole(authentication);
        boolean isOwner = order.getUser() != null && order.getUser().getId().equals(userId);
        if (!isOwner && !"ADMIN".equals(role)) {
            throw new ApiException("You do not have access to this invoice");
        }

        byte[] pdf = invoiceService.generateInvoice(order);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("invoice-" + order.getId() + ".pdf")
                .build());
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
