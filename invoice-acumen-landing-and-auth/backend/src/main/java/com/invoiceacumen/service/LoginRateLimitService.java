package com.invoiceacumen.service;

import com.invoiceacumen.exception.RateLimitExceededException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class LoginRateLimitService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final String LIMIT_MESSAGE = "Too many failed login attempts. Please try again in 15 minutes.";

    private final ConcurrentMap<String, Deque<Instant>> failedAttempts = new ConcurrentHashMap<>();

    public void checkAllowed(String email) {
        String key = normalizeEmail(email);
        Deque<Instant> attempts = failedAttempts.get(key);
        if (attempts == null) {
            return;
        }

        synchronized (attempts) {
            removeExpiredAttempts(attempts);
            if (attempts.size() >= MAX_FAILED_ATTEMPTS) {
                throw new RateLimitExceededException(LIMIT_MESSAGE);
            }
            if (attempts.isEmpty()) {
                failedAttempts.remove(key, attempts);
            }
        }
    }

    public void recordFailedAttempt(String email) {
        String key = normalizeEmail(email);
        Deque<Instant> attempts = failedAttempts.computeIfAbsent(key, ignored -> new ArrayDeque<>());

        synchronized (attempts) {
            removeExpiredAttempts(attempts);
            attempts.addLast(Instant.now());
        }
    }

    public void clearAttempts(String email) {
        failedAttempts.remove(normalizeEmail(email));
    }

    private void removeExpiredAttempts(Deque<Instant> attempts) {
        Instant cutoff = Instant.now().minus(WINDOW);
        while (!attempts.isEmpty() && !attempts.peekFirst().isAfter(cutoff)) {
            attempts.removeFirst();
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "<unknown>" : email.trim().toLowerCase(Locale.ROOT);
    }
}
