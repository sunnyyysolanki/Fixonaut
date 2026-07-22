package com.fixonaut.backend.service;

import java.time.Instant;
import java.util.UUID;

public record ServiceRequestResponse(
        UUID id,
        UUID customerId,
        String customerName,
        UUID assignedTechnicianId,
        String assignedTechnicianName,
        String title,
        String description,
        ServiceRequestPriority priority,
        ServiceRequestStatus status,
        Instant scheduledAt,
        Long version,
        Instant createdAt,
        Instant updatedAt
) {
}