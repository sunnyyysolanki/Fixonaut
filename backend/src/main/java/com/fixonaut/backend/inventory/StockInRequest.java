package com.fixonaut.backend.inventory;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record StockInRequest(

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be greater than zero")
        Integer quantity,

        @Size(
                max = 1000,
                message = "Note must not exceed 1000 characters"
        )
        String note,

        @NotNull(message = "Unit cost is required")
        BigDecimal unitCost
) {
}