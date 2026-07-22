package com.fixonaut.backend.scheduling;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

public record AvailabilityResponse(
        UUID id,
        UUID technicianId,
        String technicianName,
        Integer dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}