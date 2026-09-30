package com.invoiceacumen.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Customer information (captured per-address, since delivery contact may differ from account owner)
    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phone;

    private String email;

    // Delivery address
    @Column(nullable = false)
    private String houseNo;

    private String buildingName;

    private String streetNo;

    @Column(nullable = false)
    private String streetName;

    @Column(nullable = false)
    private String area;

    private String landmark;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String pincode;

    @Column(nullable = false)
    private String country = "India";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AddressType addressType = AddressType.HOME;

    private boolean isDefault = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
