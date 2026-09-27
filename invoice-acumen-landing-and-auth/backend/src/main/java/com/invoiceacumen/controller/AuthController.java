package com.invoiceacumen.controller;

import com.invoiceacumen.dto.ApiResponse;
import com.invoiceacumen.dto.AuthResponse;
import com.invoiceacumen.dto.LoginRequest;
import com.invoiceacumen.dto.RegisterRequest;
import com.invoiceacumen.exception.ApiException;
import com.invoiceacumen.security.CookieUtil;
import com.invoiceacumen.service.AuthService;
import com.invoiceacumen.service.LoginRateLimitService;
import com.invoiceacumen.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final LoginRateLimitService loginRateLimitService;
    private final RefreshTokenService refreshTokenService;
    private final CookieUtil cookieUtil;

    public AuthController(AuthService authService, LoginRateLimitService loginRateLimitService,
                           RefreshTokenService refreshTokenService, CookieUtil cookieUtil) {
        this.authService = authService;
        this.loginRateLimitService = loginRateLimitService;
        this.refreshTokenService = refreshTokenService;
        this.cookieUtil = cookieUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse auth = authService.register(request);
        return withAuthCookies(auth, "Registration successful");
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        loginRateLimitService.checkAllowed(request.getEmail());
        try {
            AuthResponse auth = authService.login(request);
            loginRateLimitService.clearAttempts(request.getEmail());
            return withAuthCookies(auth, "Login successful");
        } catch (ApiException ex) {
            loginRateLimitService.recordFailedAttempt(request.getEmail());
            throw ex;
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(HttpServletRequest request) {
        String refreshTokenValue = cookieUtil.readCookie(request, CookieUtil.REFRESH_TOKEN_COOKIE);
        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            throw new ApiException("No refresh token found. Please log in again.");
        }
        AuthResponse auth = authService.refreshAccessToken(refreshTokenValue);
        return withAuthCookies(auth, "Token refreshed");
    }

    @GetMapping("/me")
    public ApiResponse<AuthResponse> me(Authentication authentication) {
        if (authentication == null) {
            throw new ApiException("Not authenticated");
        }
        return ApiResponse.ok(authService.getCurrentUser(authentication.getName()));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, Authentication authentication) {
        if (authentication != null) {
            authService.logout(authentication.getName());
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtil.clearAccessTokenCookie().toString())
                .header(HttpHeaders.SET_COOKIE, cookieUtil.clearRefreshTokenCookie().toString())
                .body(ApiResponse.ok("Logged out", null));
    }

    /**
     * Issues the access/refresh tokens as HttpOnly cookies and strips them from the
     * JSON body — JavaScript never has a readable copy, closing the XSS token-theft path.
     */
    private ResponseEntity<ApiResponse<AuthResponse>> withAuthCookies(AuthResponse auth, String message) {
        String accessToken = auth.getToken();
        String refreshToken = auth.getRefreshToken();
        auth.setToken(null);
        auth.setRefreshToken(null);

        return ResponseEntity.status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, cookieUtil.buildAccessTokenCookie(accessToken).toString())
                .header(HttpHeaders.SET_COOKIE, cookieUtil.buildRefreshTokenCookie(refreshToken).toString())
                .body(ApiResponse.ok(message, auth));
    }
}
