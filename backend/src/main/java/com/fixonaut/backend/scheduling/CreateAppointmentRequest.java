package com.fixonaut.backend.scheduling;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record CreateAppointmentRequest(

        @NotNull(message = "Service request ID is required")
        UUID serviceRequestId,

        @NotNull(message = "Technician ID is required")
        UUID technicianId,

        @NotNull(message = "Start time is required")
        Instant startsAt,

        @NotNull(message = "End time is required")
        Instant endsAt,

        @Size(
                max = 1000,
                message = "Notes must not exceed 1000 characters"
        )
        String notes
) {
}