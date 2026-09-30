package com.invoiceacumen.service;

import com.invoiceacumen.entity.Notification;
import com.invoiceacumen.entity.Order;
import com.invoiceacumen.exception.ApiException;
import com.invoiceacumen.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void notifyOrderStatusChange(Order order) {
        Notification notification = new Notification();
        notification.setUser(order.getUser());
        notification.setRelatedOrderId(order.getId());
        notification.setTitle("Order #" + order.getId() + " updated");
        notification.setMessage("Your order status is now " + order.getStatus() +
                " and payment status is " + order.getPaymentStatus() + ".");
        notificationRepository.save(notification);
    }

    public List<Notification> getForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public Notification markRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ApiException("Notification not found"));
        if (!notification.getUser().getId().equals(userId)) {
            throw new ApiException("You do not have access to this notification");
        }
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
}
