package com.invoiceacumen.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Pattern(regexp = "^$|\\d+$", message = "Phone number must contain digits only")
    private String phone;
}
