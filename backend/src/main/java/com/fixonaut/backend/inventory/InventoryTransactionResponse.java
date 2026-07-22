package com.fixonaut.backend.inventory;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record InventoryTransactionResponse(
        UUID id,
        UUID partId,
        String partName,
        UUID serviceRequestId,
        InventoryTransactionType transactionType,
        Integer quantity,
        BigDecimal unitCost,
        String note,
        UUID createdByUserId,
        String createdByUserName,
        Instant createdAt
) {
}