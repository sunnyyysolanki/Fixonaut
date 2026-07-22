package com.fixonaut.backend.scheduling;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record UpdateAppointmentRequest(

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