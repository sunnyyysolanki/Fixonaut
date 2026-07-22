package com.fixonaut.backend.service;

import java.time.Instant;
import java.util.UUID;

public record ServiceRequestStatusHistoryResponse(
        UUID id,
        UUID changedByUserId,
        String changedByUserName,
        ServiceRequestStatus fromStatus,
        ServiceRequestStatus toStatus,
        String note,
        Instant changedAt
) {
}