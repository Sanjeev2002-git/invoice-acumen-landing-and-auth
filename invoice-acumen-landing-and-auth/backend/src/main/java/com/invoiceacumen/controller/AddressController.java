package com.invoiceacumen.controller;

import com.invoiceacumen.dto.ApiResponse;
import com.invoiceacumen.entity.Address;
import com.invoiceacumen.security.JwtUtil;
import com.invoiceacumen.service.AddressService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;
    private final JwtUtil jwtUtil;

    public AddressController(AddressService addressService, JwtUtil jwtUtil) {
        this.addressService = addressService;
        this.jwtUtil = jwtUtil;
    }

    private Long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    @GetMapping
    public ApiResponse<List<Address>> getMyAddresses(HttpServletRequest request) {
        return ApiResponse.ok(addressService.getUserAddresses(extractUserId(request)));
    }

    @PostMapping
    public ApiResponse<Address> add(@RequestBody Address address, HttpServletRequest request) {
        return ApiResponse.ok("Address added", addressService.addAddress(extractUserId(request), address));
    }

    @PutMapping("/{id}")
    public ApiResponse<Address> update(@PathVariable Long id, @RequestBody Address address, HttpServletRequest request) {
        return ApiResponse.ok("Address updated", addressService.updateAddress(extractUserId(request), id, address));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        addressService.delete(extractUserId(request), id);
        return ApiResponse.ok("Address deleted", null);
    }
}
