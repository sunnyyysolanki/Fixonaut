package com.fixonaut.backend.scheduling;

import com.fixonaut.backend.common.exception.ConflictException;
import com.fixonaut.backend.common.exception.ResourceNotFoundException;
import com.fixonaut.backend.organization.OrganizationEntity;
import com.fixonaut.backend.organization.OrganizationRepository;
import com.fixonaut.backend.security.AuthenticatedUserContext;
import com.fixonaut.backend.service.ServiceRequestEntity;
import com.fixonaut.backend.service.ServiceRequestRepository;
import com.fixonaut.backend.user.UserEntity;
import com.fixonaut.backend.user.UserRepository;
import com.fixonaut.backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SchedulingService {

    private static final ZoneId BUSINESS_TIME_ZONE =
            ZoneId.of("Asia/Kolkata");

    private final AppointmentRepository appointmentRepository;
    private final TechnicianAvailabilityRepository
            availabilityRepository;
    private final OrganizationRepository organizationRepository;
    private final ServiceRequestRepository
            serviceRequestRepository;
    private final UserRepository userRepository;
    private final AuthenticatedUserContext
            authenticatedUserContext;

    @Transactional
    public AppointmentResponse createAppointment(
            CreateAppointmentRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        OrganizationEntity organization =
                findOrganization(organizationId);

        ServiceRequestEntity serviceRequest =
                serviceRequestRepository
                        .findByIdAndOrganizationId(
                                request.serviceRequestId(),
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Service request not found"
                                )
                        );

        UserEntity technician =
                findTechnician(
                        request.technicianId(),
                        organizationId
                );

        validateAppointmentTime(
                request.startsAt(),
                request.endsAt()
        );

        validateAvailability(
                organizationId,
                technician.getId(),
                request.startsAt(),
                request.endsAt()
        );

        boolean hasConflict =
                appointmentRepository
                        .existsConflictingAppointment(
                                organizationId,
                                technician.getId(),
                                request.startsAt(),
                                request.endsAt(),
                                null
                        );

        if (hasConflict) {
            throw new ConflictException(
                    "TECHNICIAN_APPOINTMENT_CONFLICT",
                    "Technician already has an overlapping appointment"
            );
        }

        appointmentRepository
                .findByServiceRequestIdAndOrganizationId(
                        serviceRequest.getId(),
                        organizationId
                )
                .ifPresent(existingAppointment -> {
                    throw new ConflictException(
                            "SERVICE_REQUEST_ALREADY_SCHEDULED",
                            "This service request already has an appointment"
                    );
                });

        AppointmentEntity appointment =
                new AppointmentEntity(
                        organization,
                        serviceRequest,
                        technician,
                        request.startsAt(),
                        request.endsAt(),
                        normalizeNullable(request.notes())
                );

        return toResponse(
                appointmentRepository.save(appointment)
        );
    }

    @Transactional
    public AppointmentResponse updateAppointment(
            UUID appointmentId,
            UpdateAppointmentRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        AppointmentEntity appointment =
                findAppointment(
                        appointmentId,
                        organizationId
                );

        validateAppointmentTime(
                request.startsAt(),
                request.endsAt()
        );

        boolean hasConflict =
                appointmentRepository
                        .existsConflictingAppointment(
                                organizationId,
                                appointment.getTechnician().getId(),
                                request.startsAt(),
                                request.endsAt(),
                                appointmentId
                        );

        if (hasConflict) {
            throw new ConflictException(
                    "TECHNICIAN_APPOINTMENT_CONFLICT",
                    "Technician already has an overlapping appointment"
            );
        }

        appointment.updateTime(
                request.startsAt(),
                request.endsAt()
        );

        return toResponse(appointment);
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointment(
            UUID appointmentId
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        return toResponse(
                findAppointment(
                        appointmentId,
                        organizationId
                )
        );
    }

    @Transactional
    public AppointmentResponse confirm(
            UUID appointmentId
    ) {
        AppointmentEntity appointment =
                findAppointmentForCurrentOrganization(
                        appointmentId
                );

        appointment.confirm();

        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse start(
            UUID appointmentId
    ) {
        AppointmentEntity appointment =
                findAppointmentForCurrentOrganization(
                        appointmentId
                );

        appointment.start();

        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse complete(
            UUID appointmentId
    ) {
        AppointmentEntity appointment =
                findAppointmentForCurrentOrganization(
                        appointmentId
                );

        appointment.complete();

        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse cancel(
            UUID appointmentId
    ) {
        AppointmentEntity appointment =
                findAppointmentForCurrentOrganization(
                        appointmentId
                );

        appointment.cancel();

        return toResponse(appointment);
    }

    @Transactional
    public AvailabilityResponse createAvailability(
            CreateAvailabilityRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        OrganizationEntity organization =
                findOrganization(organizationId);

        UserEntity technician =
                findTechnician(
                        request.technicianId(),
                        organizationId
                );

        TechnicianAvailabilityEntity availability =
                new TechnicianAvailabilityEntity(
                        organization,
                        technician,
                        request.dayOfWeek(),
                        request.startTime(),
                        request.endTime()
                );

        return toAvailabilityResponse(
                availabilityRepository.save(availability)
        );
    }

    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getAvailability(
            UUID technicianId
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        findTechnician(
                technicianId,
                organizationId
        );

        return availabilityRepository
                .findActiveAvailability(
                        organizationId,
                        technicianId
                )
                .stream()
                .map(this::toAvailabilityResponse)
                .toList();
    }

    private void validateAppointmentTime(
            Instant startsAt,
            Instant endsAt
    ) {
        if (startsAt == null || endsAt == null) {
            throw new IllegalArgumentException(
                    "Appointment start and end times are required"
            );
        }

        if (!startsAt.isBefore(endsAt)) {
            throw new IllegalArgumentException(
                    "Appointment start must be before appointment end"
            );
        }
    }

    private void validateAvailability(
            UUID organizationId,
            UUID technicianId,
            Instant startsAt,
            Instant endsAt
    ) {
        List<TechnicianAvailabilityEntity> availabilityRules =
                availabilityRepository
                        .findActiveAvailability(
                                organizationId,
                                technicianId
                        );

        /*
         * If no availability rules are configured yet, allow the
         * appointment. This makes the first version usable while
         * availability setup is optional.
         */
        if (availabilityRules.isEmpty()) {
            return;
        }

        ZonedDateTime start =
                startsAt.atZone(BUSINESS_TIME_ZONE);

        ZonedDateTime end =
                endsAt.atZone(BUSINESS_TIME_ZONE);

        int dayOfWeek =
                start.getDayOfWeek().getValue();

        boolean matchesAvailability =
                availabilityRules
                        .stream()
                        .anyMatch(rule ->
                                rule.getDayOfWeek().equals(dayOfWeek)
                                        && !start.toLocalTime()
                                        .isBefore(rule.getStartTime())
                                        && !end.toLocalTime()
                                        .isAfter(rule.getEndTime())
                        );

        if (!matchesAvailability) {
            throw new ConflictException(
                    "OUTSIDE_TECHNICIAN_AVAILABILITY",
                    "Appointment is outside technician availability"
            );
        }
    }

    private UserEntity findTechnician(
            UUID technicianId,
            UUID organizationId
    ) {
        UserEntity technician =
                userRepository.findById(technicianId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Technician not found"
                                )
                        );

        boolean sameOrganization =
                technician.getOrganization()
                        .getId()
                        .equals(organizationId);

        if (!sameOrganization) {
            throw new ResourceNotFoundException(
                    "Technician not found"
            );
        }

        if (!technician.hasRole(UserRole.TECHNICIAN)) {
            throw new IllegalStateException(
                    "Selected user is not a technician"
            );
        }

        if (!technician.isActive()) {
            throw new IllegalStateException(
                    "Technician is inactive"
            );
        }

        return technician;
    }

    private OrganizationEntity findOrganization(
            UUID organizationId
    ) {
        return organizationRepository
                .findById(organizationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Organization not found"
                        )
                );
    }

    private AppointmentEntity findAppointment(
            UUID appointmentId,
            UUID organizationId
    ) {
        return appointmentRepository
                .findByIdAndOrganizationId(
                        appointmentId,
                        organizationId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Appointment not found"
                        )
                );
    }

    private AppointmentEntity
    findAppointmentForCurrentOrganization(
            UUID appointmentId
    ) {
        UUID organizationId =
                authenticatedUserContext
                        .getCurrentOrganizationId();

        return findAppointment(
                appointmentId,
                organizationId
        );
    }

    private AppointmentResponse toResponse(
            AppointmentEntity appointment
    ) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getServiceRequest().getId(),
                appointment.getServiceRequest().getTitle(),
                appointment.getTechnician().getId(),
                appointment.getTechnician().getName(),
                appointment.getStartsAt(),
                appointment.getEndsAt(),
                appointment.getStatus(),
                appointment.getNotes(),
                appointment.getCreatedAt(),
                appointment.getUpdatedAt()
        );
    }

    private AvailabilityResponse toAvailabilityResponse(
            TechnicianAvailabilityEntity availability
    ) {
        return new AvailabilityResponse(
                availability.getId(),
                availability.getTechnician().getId(),
                availability.getTechnician().getName(),
                availability.getDayOfWeek(),
                availability.getStartTime(),
                availability.getEndTime(),
                availability.isActive(),
                availability.getCreatedAt(),
                availability.getUpdatedAt()
        );
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        return normalized.isBlank() ? null : normalized;
    }
}