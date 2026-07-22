package com.fixonaut.backend.billing;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record InvoiceSummaryResponse(
        UUID id,
        String invoiceNumber,
        UUID serviceRequestId,
        String serviceRequestTitle,
        InvoiceStatus status,
        PaymentStatus paymentStatus,
        String currency,
        BigDecimal totalAmount,
        BigDecimal amountPaid,
        Instant issuedAt,
        Instant createdAt
) {
}