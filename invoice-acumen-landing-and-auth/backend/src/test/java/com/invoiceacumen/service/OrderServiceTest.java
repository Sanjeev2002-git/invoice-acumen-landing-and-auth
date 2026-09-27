package com.invoiceacumen.service;

import com.invoiceacumen.dto.CreateOrderRequest;
import com.invoiceacumen.dto.OrderItemRequest;
import com.invoiceacumen.entity.Address;
import com.invoiceacumen.entity.PaymentType;
import com.invoiceacumen.entity.Product;
import com.invoiceacumen.entity.User;
import com.invoiceacumen.exception.ApiException;
import com.invoiceacumen.repository.AddressRepository;
import com.invoiceacumen.repository.OrderRepository;
import com.invoiceacumen.repository.ProductRepository;
import com.invoiceacumen.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderServiceTest {

    @Test
    void rejectsAnAddressOwnedByAnotherUserBeforeChangingInventory() {
        OrderRepository orderRepository = mock(OrderRepository.class);
        ProductRepository productRepository = mock(ProductRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        AddressRepository addressRepository = mock(AddressRepository.class);
        ProductService productService = mock(ProductService.class);
        CouponService couponService = mock(CouponService.class);
        NotificationService notificationService = mock(NotificationService.class);
        OrderService service = new OrderService(orderRepository, productRepository, userRepository, addressRepository,
                productService, couponService, notificationService);

        User buyer = user(1L);
        Address otherUsersAddress = new Address();
        otherUsersAddress.setUser(user(2L));
        when(userRepository.findById(1L)).thenReturn(Optional.of(buyer));
        when(addressRepository.findById(9L)).thenReturn(Optional.of(otherUsersAddress));

        CreateOrderRequest request = request(9L);

        assertThrows(ApiException.class, () -> service.createOrder(1L, request));
        verify(productRepository, never()).findByIdForUpdate(org.mockito.ArgumentMatchers.anyLong());
        verify(productService, never()).deductStock(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyInt(), org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void locksTheProductBeforeCheckingAndDeductingStock() {
        OrderRepository orderRepository = mock(OrderRepository.class);
        ProductRepository productRepository = mock(ProductRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        AddressRepository addressRepository = mock(AddressRepository.class);
        ProductService productService = mock(ProductService.class);
        CouponService couponService = mock(CouponService.class);
        NotificationService notificationService = mock(NotificationService.class);
        OrderService service = new OrderService(orderRepository, productRepository, userRepository, addressRepository,
                productService, couponService, notificationService);

        Product product = new Product();
        product.setId(4L);
        product.setName("Paracetamol");
        product.setPrice(new BigDecimal("10.00"));
        product.setStockQuantity(5);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L)));
        when(productRepository.findByIdForUpdate(4L)).thenReturn(Optional.of(product));
        when(orderRepository.countByOrderDateBetween(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(orderRepository.save(org.mockito.ArgumentMatchers.any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.createOrder(1L, request(null));

        verify(productRepository).findByIdForUpdate(4L);
        verify(productService).deductStock(product, 1, "Order sale");
    }

    private CreateOrderRequest request(Long addressId) {
        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(4L);
        item.setQuantity(1);
        CreateOrderRequest request = new CreateOrderRequest();
        request.setItems(List.of(item));
        request.setAddressId(addressId);
        request.setPaymentMethod(PaymentType.COD);
        return request;
    }

    private User user(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }
}
