package com.fixonaut.backend.service;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record UpdateServiceRequestRequest(

        @NotBlank(message = "Title is required")
        @Size(
                min = 3,
                max = 180,
                message = "Title must be between 3 and 180 characters"
        )
        String title,

        @NotBlank(message = "Description is required")
        @Size(
                min = 5,
                max = 5000,
                message = "Description must be between 5 and 5000 characters"
        )
        String description,

        ServiceRequestPriority priority,

        Instant scheduledAt
) {
}