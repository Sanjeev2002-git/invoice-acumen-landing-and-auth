package com.invoiceacumen.service;

import com.invoiceacumen.entity.Address;
import com.invoiceacumen.entity.AddressType;
import com.invoiceacumen.entity.User;
import com.invoiceacumen.exception.ApiException;
import com.invoiceacumen.repository.AddressRepository;
import com.invoiceacumen.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    public List<Address> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    public Address addAddress(Long userId, Address address) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ApiException("User not found"));
        validate(address);
        address.setUser(user);
        if (address.getCountry() == null || address.getCountry().isBlank()) {
            address.setCountry("India");
        }
        if (address.getAddressType() == null) {
            address.setAddressType(AddressType.HOME);
        }
        return addressRepository.save(address);
    }

    private void validate(Address address) {
        if (address.getPhone() == null || !address.getPhone().matches("\\d{10}")) {
            throw new ApiException("Mobile number must be exactly 10 digits");
        }
        if (address.getPincode() == null || !address.getPincode().matches("\\d{6}")) {
            throw new ApiException("PIN code must be exactly 6 digits");
        }
        if (address.getFullName() == null || address.getFullName().isBlank()) {
            throw new ApiException("Full name is required");
        }
    }

    public Address updateAddress(Long userId, Long addressId, Address updated) {
        Address existing = addressRepository.findById(addressId).orElseThrow(() -> new ApiException("Address not found"));
        assertOwnedByUser(existing, userId);
        validate(updated);
        existing.setFullName(updated.getFullName());
        existing.setPhone(updated.getPhone());
        existing.setEmail(updated.getEmail());
        existing.setHouseNo(updated.getHouseNo());
        existing.setBuildingName(updated.getBuildingName());
        existing.setStreetNo(updated.getStreetNo());
        existing.setStreetName(updated.getStreetName());
        existing.setArea(updated.getArea());
        existing.setLandmark(updated.getLandmark());
        existing.setCity(updated.getCity());
        existing.setState(updated.getState());
        existing.setPincode(updated.getPincode());
        existing.setCountry(updated.getCountry() != null && !updated.getCountry().isBlank() ? updated.getCountry() : "India");
        existing.setAddressType(updated.getAddressType() != null ? updated.getAddressType() : AddressType.HOME);
        existing.setDefault(updated.isDefault());
        return addressRepository.save(existing);
    }

    public void delete(Long userId, Long addressId) {
        Address existing = addressRepository.findById(addressId).orElseThrow(() -> new ApiException("Address not found"));
        assertOwnedByUser(existing, userId);
        addressRepository.deleteById(addressId);
    }

    private void assertOwnedByUser(Address address, Long userId) {
        if (address.getUser() == null || !address.getUser().getId().equals(userId)) {
            throw new ApiException("You do not have access to this address");
        }
    }
}
