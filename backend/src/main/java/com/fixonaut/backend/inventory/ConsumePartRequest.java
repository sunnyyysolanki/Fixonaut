package com.fixonaut.backend.inventory;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record ConsumePartRequest(

        @NotNull(message = "Part ID is required")
        UUID partId,

        @NotNull(message = "Service request ID is required")
        UUID serviceRequestId,

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be greater than zero")
        Integer quantity,

        @NotNull(message = "Unit cost is required")
        BigDecimal unitCost,

        @Size(
                max = 1000,
                message = "Note must not exceed 1000 characters"
        )
        String note
) {
}