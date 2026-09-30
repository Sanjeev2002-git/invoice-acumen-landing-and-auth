package com.invoiceacumen.service;

import com.invoiceacumen.dto.AuthResponse;
import com.invoiceacumen.dto.LoginRequest;
import com.invoiceacumen.dto.RegisterRequest;
import com.invoiceacumen.entity.Role;
import com.invoiceacumen.entity.User;
import com.invoiceacumen.entity.RefreshToken;
import com.invoiceacumen.exception.ApiException;
import com.invoiceacumen.repository.UserRepository;
import com.invoiceacumen.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                        JwtUtil jwtUtil, RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(Role.CUSTOMER);

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole().name(), saved.getId());
        String refreshToken = refreshTokenService.createRefreshToken(saved);

        return new AuthResponse(token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole().name(),
                saved.getPhone(), saved.getAvatarUrl(), refreshToken, saved.getCreatedAt());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name(),
                user.getPhone(), user.getAvatarUrl(), refreshToken, user.getCreatedAt());
    }

    public AuthResponse refreshAccessToken(String refreshTokenValue) {
        RefreshToken storedToken = refreshTokenService.findByToken(refreshTokenValue);
        RefreshToken validToken = refreshTokenService.verifyExpiration(storedToken);
        User user = validToken.getUser();

        String newAccessToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return new AuthResponse(newAccessToken, user.getId(), user.getName(), user.getEmail(), user.getRole().name(),
                user.getPhone(), user.getAvatarUrl(), refreshTokenValue, user.getCreatedAt());
    }

    /**
     * Returns the logged-in user's profile with no token fields set, used by the
     * frontend to restore a session on page load without ever touching the cookie.
     */
    public AuthResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));
        return new AuthResponse(null, user.getId(), user.getName(), user.getEmail(), user.getRole().name(),
                user.getPhone(), user.getAvatarUrl(), null, user.getCreatedAt());
    }

    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(user -> refreshTokenService.revokeAllForUser(user.getId()));
    }
}
