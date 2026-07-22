package com.fixonaut.backend.inventory;

import java.time.Instant;
import java.util.UUID;

public record InventoryTransactionResponse(
        UUID id,
        UUID partId,
        String partName,
        UUID serviceRequestId,
        InventoryTransactionType transactionType,
        Integer quantity,
        String note,
        UUID createdByUserId,
        String createdByUserName,
        Instant createdAt
) {
}