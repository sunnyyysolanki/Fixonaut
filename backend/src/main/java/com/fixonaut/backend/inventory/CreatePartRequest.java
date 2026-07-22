package com.fixonaut.backend.inventory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePartRequest(

        @NotBlank(message = "SKU is required")
        @Size(
                max = 80,
                message = "SKU must not exceed 80 characters"
        )
        String sku,

        @NotBlank(message = "Part name is required")
        @Size(
                min = 2,
                max = 180,
                message = "Part name must be between 2 and 180 characters"
        )
        String name,

        @Size(
                max = 30,
                message = "Unit must not exceed 30 characters"
        )
        String unit,

        Integer reorderLevel
) {
}