package com.invoiceacumen.controller;

import com.invoiceacumen.dto.ApiResponse;
import com.invoiceacumen.dto.ReviewRequest;
import com.invoiceacumen.entity.Review;
import com.invoiceacumen.security.JwtUtil;
import com.invoiceacumen.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final JwtUtil jwtUtil;

    public ReviewController(ReviewService reviewService, JwtUtil jwtUtil) {
        this.reviewService = reviewService;
        this.jwtUtil = jwtUtil;
    }

    private Long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    @PostMapping
    public ApiResponse<Review> create(@Valid @RequestBody ReviewRequest reviewRequest, HttpServletRequest request) {
        Long userId = extractUserId(request);
        return ApiResponse.ok("Review submitted", reviewService.createReview(userId, reviewRequest));
    }
}
