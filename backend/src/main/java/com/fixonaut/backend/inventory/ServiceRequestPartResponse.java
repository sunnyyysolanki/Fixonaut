package com.fixonaut.backend.inventory;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ServiceRequestPartResponse(
        UUID id,
        UUID serviceRequestId,
        UUID partId,
        String partName,
        Integer quantity,
        BigDecimal unitCost,
        BigDecimal totalCost,
        UUID addedByUserId,
        String addedByUserName,
        Instant createdAt
) {
}