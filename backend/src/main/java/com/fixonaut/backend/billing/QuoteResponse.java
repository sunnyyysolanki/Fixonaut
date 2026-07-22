package com.fixonaut.backend.billing;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record QuoteResponse(
        UUID id,
        String quoteNumber,
        UUID serviceRequestId,
        QuoteStatus status,
        String currency,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal taxAmount,
        BigDecimal totalAmount,
        LocalDate validUntil,
        String notes,
        List<QuoteItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {
}