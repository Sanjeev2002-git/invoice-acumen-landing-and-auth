package com.invoiceacumen.config;

import com.invoiceacumen.security.CookieUtil;

import com.invoiceacumen.controller.ProductController;
import com.invoiceacumen.entity.Product;
import com.invoiceacumen.security.JwtAuthFilter;
import com.invoiceacumen.security.JwtUtil;
import com.invoiceacumen.service.ProductService;
import com.invoiceacumen.service.ReviewService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class ProductAuthorizationTest {

    @MockBean private CookieUtil cookieUtil;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @MockBean
    private ReviewService reviewService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    void allowsAnonymousProductReads() throws Exception {
        when(productService.getAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk());
    }

    @Test
    void rejectsAnonymousProductCreation() throws Exception {
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void allowsAdminProductCreation() throws Exception {
        Product product = new Product();
        product.setId(1L);
        product.setName("Paracetamol");
        product.setPrice(new BigDecimal("10.00"));
        when(productService.create(org.mockito.ArgumentMatchers.any(Product.class))).thenReturn(product);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson()))
                .andExpect(status().isOk());
    }

    private String productJson() {
        return "{\"name\":\"Paracetamol\",\"price\":10.00,\"stockQuantity\":10,\"reorderThreshold\":2}";
    }
}
