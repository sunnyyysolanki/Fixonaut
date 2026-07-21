package com.fixonaut.backend.customer;

import java.time.Instant;
import java.util.UUID;

public record CustomerResponse(
        UUID id,
        String name,
        String phone,
        String email,
        String address,
        String city,
        String state,
        String postalCode,
        String notes,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}