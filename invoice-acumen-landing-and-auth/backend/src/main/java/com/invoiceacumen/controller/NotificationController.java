package com.invoiceacumen.controller;

import com.invoiceacumen.dto.ApiResponse;
import com.invoiceacumen.entity.Notification;
import com.invoiceacumen.security.JwtUtil;
import com.invoiceacumen.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;

    public NotificationController(NotificationService notificationService, JwtUtil jwtUtil) {
        this.notificationService = notificationService;
        this.jwtUtil = jwtUtil;
    }

    private Long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    @GetMapping("/my")
    public ApiResponse<List<Notification>> myNotifications(HttpServletRequest request) {
        return ApiResponse.ok(notificationService.getForUser(extractUserId(request)));
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> unreadCount(HttpServletRequest request) {
        long count = notificationService.getUnreadCount(extractUserId(request));
        return ApiResponse.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<Notification> markRead(@PathVariable Long id, HttpServletRequest request) {
        return ApiResponse.ok(notificationService.markRead(extractUserId(request), id));
    }

    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllRead(HttpServletRequest request) {
        notificationService.markAllRead(extractUserId(request));
        return ApiResponse.ok("All notifications marked as read", null);
    }
}
