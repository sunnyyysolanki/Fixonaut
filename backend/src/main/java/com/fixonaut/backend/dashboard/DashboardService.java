package com.fixonaut.backend.dashboard;

import com.fixonaut.backend.billing.InvoiceRepository;
import com.fixonaut.backend.security.AuthenticatedUserContext;
import com.fixonaut.backend.service.ServiceRequestRepository;
import com.fixonaut.backend.service.ServiceRequestStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.EnumSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final ZoneId BUSINESS_TIME_ZONE =
            ZoneId.of("Asia/Kolkata");

    private final ServiceRequestRepository
            serviceRequestRepository;

    private final InvoiceRepository invoiceRepository;

    private final AuthenticatedUserContext
            authenticatedUserContext;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        UUID organizationId =
                authenticatedUserContext
                        .getCurrentOrganizationId();

        long openRequests =
                serviceRequestRepository
                        .countByOrganizationIdAndStatusIn(
                                organizationId,
                                EnumSet.of(
                                        ServiceRequestStatus.NEW,
                                        ServiceRequestStatus.ASSIGNED,
                                        ServiceRequestStatus.ACCEPTED,
                                        ServiceRequestStatus.IN_PROGRESS,
                                        ServiceRequestStatus.WAITING_FOR_PART
                                )
                        );

        LocalDate today =
                LocalDate.now(BUSINESS_TIME_ZONE);

        Instant startOfToday =
                today
                        .atStartOfDay(BUSINESS_TIME_ZONE)
                        .toInstant();

        Instant startOfTomorrow =
                today
                        .plusDays(1)
                        .atStartOfDay(BUSINESS_TIME_ZONE)
                        .toInstant();

        long assignedToday =
                serviceRequestRepository
                        .countAssignedToday(
                                organizationId,
                                startOfToday,
                                startOfTomorrow
                        );

        LocalDate startOfWeek =
                today.with(
                        TemporalAdjusters.previousOrSame(
                                DayOfWeek.MONDAY
                        )
                );

        Instant weekStart =
                startOfWeek
                        .atStartOfDay(BUSINESS_TIME_ZONE)
                        .toInstant();

        long completedThisWeek =
                serviceRequestRepository
                        .countCompletedBetween(
                                organizationId,
                                weekStart,
                                startOfTomorrow
                        );

        BigDecimal pendingPayments =
                invoiceRepository
                        .calculatePendingPayments(
                                organizationId
                        );

        return new DashboardSummaryResponse(
                openRequests,
                assignedToday,
                completedThisWeek,
                pendingPayments
        );
    }
}