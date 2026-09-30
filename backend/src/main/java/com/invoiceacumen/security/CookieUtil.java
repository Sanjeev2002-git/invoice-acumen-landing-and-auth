package com.invoiceacumen.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    public static final String ACCESS_TOKEN_COOKIE = "access_token";
    public static final String REFRESH_TOKEN_COOKIE = "refresh_token";

    @Value("${jwt.expiration.ms}")
    private long accessTokenMaxAgeMs;

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshTokenMaxAgeMs;

    // In local dev (http://localhost) the Secure flag must be off, or browsers silently
    // drop the cookie. Set COOKIE_SECURE=true via environment once served over HTTPS.
    @Value("${app.cookie-secure:false}")
    private boolean secure;

    public ResponseCookie buildAccessTokenCookie(String token) {
        return baseCookie(ACCESS_TOKEN_COOKIE, token, accessTokenMaxAgeMs / 1000);
    }

    public ResponseCookie buildRefreshTokenCookie(String token) {
        return baseCookie(REFRESH_TOKEN_COOKIE, token, refreshTokenMaxAgeMs / 1000);
    }

    public ResponseCookie clearAccessTokenCookie() {
        return baseCookie(ACCESS_TOKEN_COOKIE, "", 0);
    }

    public ResponseCookie clearRefreshTokenCookie() {
        return baseCookie(REFRESH_TOKEN_COOKIE, "", 0);
    }

    private ResponseCookie baseCookie(String name, String value, long maxAgeSeconds) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/api")
                .maxAge(maxAgeSeconds)
                .build();
    }

    public String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (var cookie : request.getCookies()) {
            if (cookie.getName().equals(name)) return cookie.getValue();
        }
        return null;
    }
}
