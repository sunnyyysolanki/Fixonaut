package com.fixonaut.backend.billing;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateQuoteRequest(

        @NotNull(message = "Service request ID is required")
        UUID serviceRequestId,

        LocalDate validUntil,

        @DecimalMin(
                value = "0.00",
                message = "Discount cannot be negative"
        )
        BigDecimal discountAmount,

        @DecimalMin(
                value = "0.00",
                message = "Tax cannot be negative"
        )
        BigDecimal taxAmount,

        @Size(
                max = 2000,
                message = "Notes must not exceed 2000 characters"
        )
        String notes,

        @NotEmpty(message = "At least one quote item is required")
        List<@Valid QuoteItemRequest> items
) {
}