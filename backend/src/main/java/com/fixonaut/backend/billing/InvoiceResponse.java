package com.fixonaut.backend.billing;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record InvoiceResponse(
        UUID id,
        String invoiceNumber,
        UUID serviceRequestId,
        UUID quoteId,
        InvoiceStatus status,
        PaymentStatus paymentStatus,
        String currency,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal taxAmount,
        BigDecimal totalAmount,
        BigDecimal amountPaid,
        String notes,
        List<InvoiceItemResponse> items,
        Instant issuedAt,
        Instant paidAt,
        Instant createdAt,
        Instant updatedAt
) {
}