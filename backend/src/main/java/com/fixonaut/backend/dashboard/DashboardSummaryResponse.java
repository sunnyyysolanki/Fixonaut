package com.fixonaut.backend.dashboard;

import java.math.BigDecimal;

public record DashboardSummaryResponse(
        long openRequests,
        long assignedToday,
        long completedThisWeek,
        BigDecimal pendingPayments
) {
}