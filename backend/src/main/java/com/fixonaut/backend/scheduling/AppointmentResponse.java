package com.fixonaut.backend.scheduling;

import java.time.Instant;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UUID serviceRequestId,
        String serviceRequestTitle,
        UUID technicianId,
        String technicianName,
        Instant startsAt,
        Instant endsAt,
        AppointmentStatus status,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
}