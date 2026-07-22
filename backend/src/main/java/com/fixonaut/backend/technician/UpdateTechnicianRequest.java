package com.fixonaut.backend.technician;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateTechnicianRequest(

        @NotBlank(message = "Technician name is required")
        @Size(
                min = 2,
                max = 120,
                message = "Technician name must be between 2 and 120 characters"
        )
        String name,

        @NotBlank(message = "Phone number is required")
        @Size(
                min = 7,
                max = 20,
                message = "Phone number must be between 7 and 20 characters"
        )
        String phone,

        @Size(
                max = 2000,
                message = "Skills must not exceed 2000 characters"
        )
        String skills,

        @Size(
                max = 200,
                message = "Service area must not exceed 200 characters"
        )
        String serviceArea
) {
}