package com.fixonaut.backend.service;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AssignTechnicianRequest(

        @NotNull(message = "Technician ID is required")
        UUID technicianId
) {
}