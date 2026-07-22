package com.fixonaut.backend.service;

import com.fixonaut.backend.common.exception.ResourceNotFoundException;
import com.fixonaut.backend.customer.CustomerEntity;
import com.fixonaut.backend.customer.CustomerRepository;
import com.fixonaut.backend.organization.OrganizationEntity;
import com.fixonaut.backend.organization.OrganizationRepository;
import com.fixonaut.backend.security.AuthenticatedUserContext;
import com.fixonaut.backend.user.UserEntity;
import com.fixonaut.backend.user.UserRepository;
import com.fixonaut.backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fixonaut.backend.common.exception.ForbiddenException;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final ServiceRequestStatusHistoryRepository
            statusHistoryRepository;
    private final OrganizationRepository organizationRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final AuthenticatedUserContext
            authenticatedUserContext;

    @Transactional
    public ServiceRequestResponse create(
            CreateServiceRequestRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        OrganizationEntity organization =
                findOrganization(organizationId);

        CustomerEntity customer =
                customerRepository
                        .findByIdAndOrganizationId(
                                request.customerId(),
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"
                                )
                        );

        ServiceRequestPriority priority =
                request.priority() == null
                        ? ServiceRequestPriority.NORMAL
                        : request.priority();

        ServiceRequestEntity serviceRequest =
                new ServiceRequestEntity(
                        organization,
                        customer,
                        normalizeRequired(request.title()),
                        normalizeRequired(request.description()),
                        priority,
                        request.scheduledAt()
                );

        ServiceRequestEntity savedRequest =
                serviceRequestRepository.save(serviceRequest);

        UserEntity currentUser = getCurrentUser();

        recordStatusChange(
                savedRequest,
                currentUser,
                null,
                ServiceRequestStatus.NEW,
                "Service request created"
        );

        return toResponse(savedRequest);
    }

    @Transactional(readOnly = true)
    public Page<ServiceRequestResponse> search(
            ServiceRequestStatus status,
            ServiceRequestPriority priority,
            String search,
            Pageable pageable
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        return serviceRequestRepository
                .searchByOrganization(
                        organizationId,
                        status,
                        priority,
                        normalizeNullable(search),
                        pageable
                )
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ServiceRequestResponse getById(
            UUID serviceRequestId
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        ServiceRequestEntity serviceRequest =
                findRequest(serviceRequestId, organizationId);

        return toResponse(serviceRequest);
    }

    @Transactional
    public ServiceRequestResponse assignTechnician(
            UUID serviceRequestId,
            UUID technicianId
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        ServiceRequestEntity serviceRequest =
                findRequest(serviceRequestId, organizationId);

        UserEntity technician =
                userRepository.findById(technicianId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Technician not found"
                                )
                        );

        validateTechnician(
                technician,
                organizationId
        );

        ServiceRequestStatus previousStatus =
                serviceRequest.getStatus();

        serviceRequest.assignTechnician(technician);

        recordStatusChange(
                serviceRequest,
                getCurrentUser(),
                previousStatus,
                ServiceRequestStatus.ASSIGNED,
                "Technician assigned"
        );

        return toResponse(serviceRequest);
    }

    @Transactional
    public ServiceRequestResponse accept(
            UUID serviceRequestId,
            String note
    ) {
        return transition(
                serviceRequestId,
                ServiceRequestEntity::accept,
                ServiceRequestStatus.ACCEPTED,
                note
        );
    }

    @Transactional
    public ServiceRequestResponse start(
            UUID serviceRequestId,
            String note
    ) {
        return transition(
                serviceRequestId,
                ServiceRequestEntity::start,
                ServiceRequestStatus.IN_PROGRESS,
                note
        );
    }

    @Transactional
    public ServiceRequestResponse waitForPart(
            UUID serviceRequestId,
            String note
    ) {
        return transition(
                serviceRequestId,
                ServiceRequestEntity::waitForPart,
                ServiceRequestStatus.WAITING_FOR_PART,
                note
        );
    }

    @Transactional
    public ServiceRequestResponse complete(
            UUID serviceRequestId,
            String note
    ) {
        return transition(
                serviceRequestId,
                ServiceRequestEntity::complete,
                ServiceRequestStatus.COMPLETED,
                note
        );
    }

    @Transactional
    public ServiceRequestResponse cancel(
            UUID serviceRequestId,
            String note
    ) {
        return transition(
                serviceRequestId,
                ServiceRequestEntity::cancel,
                ServiceRequestStatus.CANCELLED,
                note
        );
    }

    private ServiceRequestResponse transition(
            UUID serviceRequestId,
            Consumer<ServiceRequestEntity> transitionAction,
            ServiceRequestStatus targetStatus,
            String note
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        ServiceRequestEntity serviceRequest =
                findRequest(serviceRequestId, organizationId);

        validateTransitionActor(serviceRequest);

        ServiceRequestStatus previousStatus =
                serviceRequest.getStatus();

        transitionAction.accept(serviceRequest);

        recordStatusChange(
                serviceRequest,
                getCurrentUser(),
                previousStatus,
                targetStatus,
                normalizeNullable(note)
        );

        return toResponse(serviceRequest);
    }

    private void validateTransitionActor(
            ServiceRequestEntity serviceRequest
    ) {
        if (!authenticatedUserContext.hasRole("TECHNICIAN")) {
            return;
        }

        UUID currentUserId =
                authenticatedUserContext.getCurrentUserId();

        UserEntity assignedTechnician =
                serviceRequest.getAssignedTechnician();

        if (assignedTechnician == null
                || !assignedTechnician.getId().equals(currentUserId)) {
            throw new ForbiddenException(
                    "Only the assigned technician can perform this action"
            );
        }
    }

    private void recordStatusChange(
            ServiceRequestEntity serviceRequest,
            UserEntity changedByUser,
            ServiceRequestStatus fromStatus,
            ServiceRequestStatus toStatus,
            String note
    ) {
        ServiceRequestStatusHistoryEntity history =
                new ServiceRequestStatusHistoryEntity(
                        serviceRequest,
                        changedByUser,
                        fromStatus,
                        toStatus,
                        note
                );

        statusHistoryRepository.save(history);
    }

    private void validateTechnician(
            UserEntity technician,
            UUID organizationId
    ) {
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

    private ServiceRequestEntity findRequest(
            UUID serviceRequestId,
            UUID organizationId
    ) {
        return serviceRequestRepository
                .findByIdAndOrganizationId(
                        serviceRequestId,
                        organizationId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Service request not found"
                        )
                );
    }

    private UserEntity getCurrentUser() {
        UUID currentUserId =
                authenticatedUserContext.getCurrentUserId();

        return userRepository
                .findById(currentUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        )
                );
    }

    private ServiceRequestResponse toResponse(
            ServiceRequestEntity serviceRequest
    ) {
        UserEntity technician =
                serviceRequest.getAssignedTechnician();

        return new ServiceRequestResponse(
                serviceRequest.getId(),
                serviceRequest.getCustomer().getId(),
                serviceRequest.getCustomer().getName(),
                technician != null
                        ? technician.getId()
                        : null,
                technician != null
                        ? technician.getName()
                        : null,
                serviceRequest.getTitle(),
                serviceRequest.getDescription(),
                serviceRequest.getPriority(),
                serviceRequest.getStatus(),
                serviceRequest.getScheduledAt(),
                serviceRequest.getVersion(),
                serviceRequest.getCreatedAt(),
                serviceRequest.getUpdatedAt()
        );
    }

    private String normalizeRequired(String value) {
        return value.trim();
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        return normalized.isBlank() ? null : normalized;
    }

    @Transactional(readOnly = true)
    public java.util.List<ServiceRequestStatusHistoryResponse>
    getHistory(UUID serviceRequestId) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        ServiceRequestEntity serviceRequest =
                findRequest(
                        serviceRequestId,
                        organizationId
                );

        return statusHistoryRepository
                .findByServiceRequestIdOrderByChangedAtAsc(
                        serviceRequest.getId()
                )
                .stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    private ServiceRequestStatusHistoryResponse
    toHistoryResponse(
            ServiceRequestStatusHistoryEntity history
    ) {
        return new ServiceRequestStatusHistoryResponse(
                history.getId(),
                history.getChangedByUser().getId(),
                history.getChangedByUser().getName(),
                history.getFromStatus(),
                history.getToStatus(),
                history.getNote(),
                history.getChangedAt()
        );
    }
}