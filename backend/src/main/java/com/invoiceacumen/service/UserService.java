package com.invoiceacumen.service;

import com.invoiceacumen.dto.AuthResponse;
import com.invoiceacumen.dto.ChangePasswordRequest;
import com.invoiceacumen.dto.ProfileSummary;
import com.invoiceacumen.dto.UpdateProfileRequest;
import com.invoiceacumen.entity.Order;
import com.invoiceacumen.entity.OrderStatus;
import com.invoiceacumen.entity.User;
import com.invoiceacumen.exception.ApiException;
import com.invoiceacumen.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final OrderService orderService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final Path uploadDirectory;

    public UserService(UserRepository userRepository, OrderService orderService, PasswordEncoder passwordEncoder,
                       RefreshTokenService refreshTokenService,
                       @Value("${app.upload-dir:uploads}") String uploadDir) {
        this.userRepository = userRepository;
        this.orderService = orderService;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
        this.uploadDirectory = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public Long getIdByEmail(String email) {
        return findUserByEmail(email).getId();
    }

    public AuthResponse updateMyProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmail(email);

        user.setName(request.getName().trim());
        user.setPhone(request.getPhone() == null || request.getPhone().isBlank()
                ? null
                : request.getPhone());

        User saved = userRepository.save(user);
        return toAuthResponse(saved);
    }

    public AuthResponse updateMyAvatar(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("Please select an image to upload");
        }

        String contentType = file.getContentType();
        Map<String, String> extensions = Map.of(
                "image/jpeg", "jpg",
                "image/png", "png",
                "image/webp", "webp",
                "image/gif", "gif"
        );
        String extension = contentType == null ? null : extensions.get(contentType);
        if (extension == null) {
            throw new ApiException("Avatar must be a JPG, PNG, WEBP, or GIF image");
        }

        User user = findUserByEmail(email);
        String filename = UUID.randomUUID() + "." + extension;
        Path target = uploadDirectory.resolve(filename).normalize();
        if (!target.startsWith(uploadDirectory)) {
            throw new ApiException("Invalid avatar filename");
        }

        try {
            Files.createDirectories(uploadDirectory);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            deletePreviousAvatar(user.getAvatarUrl());
        } catch (IOException ex) {
            throw new ApiException("Unable to store avatar image");
        }

        user.setAvatarUrl("/uploads/" + filename);
        return toAuthResponse(userRepository.save(user));
    }

    public void changeMyPassword(String email, ChangePasswordRequest request) {
        User user = findUserByEmail(email);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ApiException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenService.revokeAllForUser(user.getId());
    }

    public ProfileSummary getMyProfileSummary(String email) {
        User user = findUserByEmail(email);
        List<Order> orders = orderService.getUserOrders(user.getId());

        BigDecimal totalSpent = orders.stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDateTime lastOrderDate = orders.stream()
                .map(Order::getOrderDate)
                .filter(date -> date != null)
                .max(Comparator.naturalOrder())
                .orElse(null);

        return new ProfileSummary(orders.size(), totalSpent, lastOrderDate);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));
    }

    private void deletePreviousAvatar(String avatarUrl) throws IOException {
        if (avatarUrl == null || !avatarUrl.startsWith("/uploads/")) {
            return;
        }
        Path previous = uploadDirectory.resolve(avatarUrl.substring("/uploads/".length())).normalize();
        if (previous.startsWith(uploadDirectory)) {
            Files.deleteIfExists(previous);
        }
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(
                null,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getPhone(),
                user.getAvatarUrl(),
                null,
                user.getCreatedAt()
        );
    }
}
