package com.fixonaut.backend.dashboard;

import com.fixonaut.backend.service.ServiceRequestStatus;

public record StatusMetricResponse(
        ServiceRequestStatus status,
        long count
) {
}