package com.fixonaut.backend.inventory;

import java.time.Instant;
import java.util.UUID;

public record PartResponse(
        UUID id,
        String sku,
        String name,
        String unit,
        Integer quantityOnHand,
        Integer reorderLevel,
        boolean active,
        boolean lowStock,
        Instant createdAt,
        Instant updatedAt
) {
}