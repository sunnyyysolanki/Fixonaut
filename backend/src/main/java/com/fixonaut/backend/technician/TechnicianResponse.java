package com.fixonaut.backend.technician;

import java.time.Instant;
import java.util.UUID;

public record TechnicianResponse(
        UUID id,
        UUID userId,
        String name,
        String email,
        String phone,
        String skills,
        String serviceArea,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}