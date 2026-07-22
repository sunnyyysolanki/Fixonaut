package com.fixonaut.backend.billing;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record QuoteItemRequest(

        @NotNull(message = "Item type is required")
        BillingItemType itemType,

        @NotBlank(message = "Item description is required")
        @Size(
                max = 300,
                message = "Description must not exceed 300 characters"
        )
        String description,

        @NotNull(message = "Quantity is required")
        @DecimalMin(
                value = "0.01",
                message = "Quantity must be greater than zero"
        )
        BigDecimal quantity,

        @NotNull(message = "Unit price is required")
        @DecimalMin(
                value = "0.00",
                message = "Unit price cannot be negative"
        )
        BigDecimal unitPrice
) {
}