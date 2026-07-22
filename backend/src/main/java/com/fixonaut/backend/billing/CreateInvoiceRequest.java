package com.fixonaut.backend.billing;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateInvoiceRequest(

        @NotNull(message = "Service request ID is required")
        UUID serviceRequestId,

        UUID quoteId,

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

        @NotEmpty(message = "At least one invoice item is required")
        List<@Valid InvoiceItemRequest> items
) {
}