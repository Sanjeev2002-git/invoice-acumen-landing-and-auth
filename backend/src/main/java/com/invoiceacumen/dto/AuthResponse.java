package com.invoiceacumen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String avatarUrl;
    private String refreshToken;
    private LocalDateTime createdAt;
}
