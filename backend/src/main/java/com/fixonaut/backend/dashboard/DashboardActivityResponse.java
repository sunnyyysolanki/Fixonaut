package com.fixonaut.backend.dashboard;

import com.fixonaut.backend.service.ServiceRequestStatus;

import java.time.Instant;
import java.util.UUID;

public record DashboardActivityResponse(
        UUID id,
        UUID serviceRequestId,
        String serviceRequestTitle,
        ServiceRequestStatus fromStatus,
        ServiceRequestStatus toStatus,
        String note,
        String changedByUserName,
        Instant changedAt
) {
}