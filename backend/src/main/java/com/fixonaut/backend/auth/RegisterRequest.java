package com.fixonaut.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Organization name is required")
        @Size(
                min = 2,
                max = 150,
                message = "Organization name must be between 2 and 150 characters"
        )
        String organizationName,

        @NotBlank(message = "Organization slug is required")
        @Size(
                max = 100,
                message = "Organization slug must not exceed 100 characters"
        )
        @Pattern(
                regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Slug may contain only lowercase letters, numbers, and hyphens"
        )
        String organizationSlug,

        @NotBlank(message = "Name is required")
        @Size(
                min = 2,
                max = 120,
                message = "Name must be between 2 and 120 characters"
        )
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(
                max = 255,
                message = "Email must not exceed 255 characters"
        )
        String email,

        @NotBlank(message = "Password is required")
        @Size(
                min = 8,
                max = 72,
                message = "Password must be between 8 and 72 characters"
        )
        String password
) {
}