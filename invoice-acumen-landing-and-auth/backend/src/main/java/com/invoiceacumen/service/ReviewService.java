package com.invoiceacumen.service;

import com.invoiceacumen.dto.RatingSummary;
import com.invoiceacumen.dto.ReviewRequest;
import com.invoiceacumen.entity.Product;
import com.invoiceacumen.entity.Review;
import com.invoiceacumen.entity.User;
import com.invoiceacumen.exception.ApiException;
import com.invoiceacumen.repository.ProductRepository;
import com.invoiceacumen.repository.ReviewRepository;
import com.invoiceacumen.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository,
                          UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Review createReview(Long userId, ReviewRequest request) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new ApiException("Rating must be between 1 and 5");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new ApiException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApiException("Product not found"));

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return reviewRepository.save(review);
    }

    public List<Review> getForProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public RatingSummary getRatingSummary(Long productId) {
        Double avg = reviewRepository.findAverageRatingByProductId(productId);
        long count = reviewRepository.countByProductId(productId);
        return new RatingSummary(avg != null ? avg : 0.0, count);
    }
}
