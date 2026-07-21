package com.fixonaut.backend.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateCustomerRequest(

        @NotBlank(message = "Customer name is required")
        @Size(
                min = 2,
                max = 120,
                message = "Customer name must be between 2 and 120 characters"
        )
        String name,

        @NotBlank(message = "Phone number is required")
        @Size(
                min = 7,
                max = 20,
                message = "Phone number must be between 7 and 20 characters"
        )
        @Pattern(
                regexp = "^[+]?[0-9 ()-]+$",
                message = "Phone number format is invalid"
        )
        String phone,

        @Email(message = "Email must be valid")
        @Size(
                max = 255,
                message = "Email must not exceed 255 characters"
        )
        String email,

        @Size(
                max = 300,
                message = "Address must not exceed 300 characters"
        )
        String address,

        @Size(
                max = 100,
                message = "City must not exceed 100 characters"
        )
        String city,

        @Size(
                max = 100,
                message = "State must not exceed 100 characters"
        )
        String state,

        @Size(
                max = 20,
                message = "Postal code must not exceed 20 characters"
        )
        String postalCode,

        @Size(
                max = 2000,
                message = "Notes must not exceed 2000 characters"
        )
        String notes
) {
}