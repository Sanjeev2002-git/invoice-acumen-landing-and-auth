package com.invoiceacumen.service;

import com.invoiceacumen.entity.RefreshToken;
import com.invoiceacumen.entity.User;
import com.invoiceacumen.exception.ApiException;
import com.invoiceacumen.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    private final RefreshTokenRepository repo;

    public RefreshTokenService(RefreshTokenRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public String createRefreshToken(User user) {
        repo.deleteByUserId(user.getId());
        String rawToken = UUID.randomUUID().toString();
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setToken(hash(rawToken));
        token.setExpiryDate(Instant.now().plusMillis(refreshExpirationMs));
        repo.save(token);
        return rawToken;
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            repo.delete(token);
            throw new ApiException("Refresh token expired. Please login again.");
        }
        return token;
    }

    public RefreshToken findByToken(String token) {
        return repo.findByToken(hash(token))
                .orElseThrow(() -> new ApiException("Invalid refresh token"));
    }

    @Transactional
    public void revokeAllForUser(Long userId) {
        repo.deleteByUserId(userId);
    }

    private String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }
}
