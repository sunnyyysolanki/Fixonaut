package com.fixonaut.backend.inventory;

import com.fixonaut.backend.common.exception.ConflictException;
import com.fixonaut.backend.common.exception.ResourceNotFoundException;
import com.fixonaut.backend.customer.CustomerEntity;
import com.fixonaut.backend.organization.OrganizationEntity;
import com.fixonaut.backend.organization.OrganizationRepository;
import com.fixonaut.backend.security.AuthenticatedUserContext;
import com.fixonaut.backend.service.ServiceRequestEntity;
import com.fixonaut.backend.service.ServiceRequestRepository;
import com.fixonaut.backend.user.UserEntity;
import com.fixonaut.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final PartRepository partRepository;

    private final InventoryTransactionRepository
            inventoryTransactionRepository;

    private final ServiceRequestPartRepository
            serviceRequestPartRepository;

    private final OrganizationRepository organizationRepository;

    private final ServiceRequestRepository
            serviceRequestRepository;

    private final UserRepository userRepository;

    private final AuthenticatedUserContext
            authenticatedUserContext;

    @Transactional
    public PartResponse createPart(
            CreatePartRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        OrganizationEntity organization =
                findOrganization(organizationId);

        String normalizedSku =
                normalizeRequired(request.sku());

        if (partRepository.existsByOrganizationIdAndSku(
                organizationId,
                normalizedSku
        )) {
            throw new ConflictException(
                    "PART_SKU_ALREADY_EXISTS",
                    "A part with this SKU already exists"
            );
        }

        PartEntity part = new PartEntity(
                organization,
                normalizedSku,
                normalizeRequired(request.name()),
                normalizeNullable(request.unit()),
                request.reorderLevel()
        );

        return toPartResponse(
                partRepository.save(part)
        );
    }

    @Transactional(readOnly = true)
    public Page<PartResponse> searchParts(
            String search,
            Pageable pageable
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        return partRepository
                .searchActiveParts(
                        organizationId,
                        normalizeNullable(search),
                        pageable
                )
                .map(this::toPartResponse);
    }

    @Transactional(readOnly = true)
    public PartResponse getPart(UUID partId) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        PartEntity part =
                partRepository
                        .findByIdAndOrganizationId(
                                partId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Part not found"
                                )
                        );

        return toPartResponse(part);
    }

    @Transactional
    public PartResponse updatePart(
            UUID partId,
            UpdatePartRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        PartEntity part =
                partRepository
                        .findByIdAndOrganizationId(
                                partId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Part not found"
                                )
                        );

        part.updateDetails(
                part.getSku(),
                normalizeRequired(request.name()),
                normalizeNullable(request.unit()),
                request.reorderLevel()
        );

        return toPartResponse(part);
    }

    @Transactional
    public PartResponse stockIn(
            UUID partId,
            StockInRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        PartEntity part =
                partRepository
                        .findByIdAndOrganizationIdForUpdate(
                                partId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Part not found"
                                )
                        );

        UserEntity currentUser = getCurrentUser();

        part.increaseStock(request.quantity());

        InventoryTransactionEntity transaction =
                new InventoryTransactionEntity(
                        part.getOrganization(),
                        part,
                        null,
                        currentUser,
                        InventoryTransactionType.STOCK_IN,
                        request.quantity(),
                        request.unitCost(),
                        normalizeNullable(request.note())
                );

        inventoryTransactionRepository.save(transaction);

        return toPartResponse(part);
    }

    @Transactional
    public ServiceRequestPartResponse consumePart(
            ConsumePartRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        PartEntity part =
                partRepository
                        .findByIdAndOrganizationIdForUpdate(
                                request.partId(),
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Part not found"
                                )
                        );

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

        if (!part.isActive()) {
            throw new ConflictException(
                    "PART_INACTIVE",
                    "Inactive parts cannot be consumed"
            );
        }

        if (part.getQuantityOnHand()
                < request.quantity()) {
            throw new ConflictException(
                    "INSUFFICIENT_STOCK",
                    "Insufficient stock for part: "
                            + part.getName()
            );
        }

        UserEntity currentUser = getCurrentUser();

        part.decreaseStock(request.quantity());

        InventoryTransactionEntity transaction =
                new InventoryTransactionEntity(
                        part.getOrganization(),
                        part,
                        serviceRequest,
                        currentUser,
                        InventoryTransactionType.STOCK_OUT,
                        request.quantity(),
                        request.unitCost(),
                        normalizeNullable(request.note())
                );

        inventoryTransactionRepository.save(transaction);

        ServiceRequestPartEntity serviceRequestPart =
                new ServiceRequestPartEntity(
                        part.getOrganization(),
                        serviceRequest,
                        part,
                        request.quantity(),
                        request.unitCost(),
                        currentUser
                );

        return toServiceRequestPartResponse(
                serviceRequestPartRepository.save(
                        serviceRequestPart
                )
        );
    }

    @Transactional(readOnly = true)
    public List<InventoryTransactionResponse>
    getPartTransactions(UUID partId) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        PartEntity part =
                partRepository
                        .findByIdAndOrganizationId(
                                partId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Part not found"
                                )
                        );

        return inventoryTransactionRepository
                .findByPartIdAndOrganizationIdOrderByCreatedAtDesc(
                        part.getId(),
                        organizationId
                )
                .stream()
                .map(this::toTransactionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ServiceRequestPartResponse>
    getServiceRequestParts(UUID serviceRequestId) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        serviceRequestRepository
                .findByIdAndOrganizationId(
                        serviceRequestId,
                        organizationId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Service request not found"
                        )
                );

        return serviceRequestPartRepository
                .findByServiceRequestIdAndOrganizationIdOrderByCreatedAtAsc(
                        serviceRequestId,
                        organizationId
                )
                .stream()
                .map(this::toServiceRequestPartResponse)
                .toList();
    }

    private PartResponse toPartResponse(
            PartEntity part
    ) {
        return new PartResponse(
                part.getId(),
                part.getSku(),
                part.getName(),
                part.getUnit(),
                part.getQuantityOnHand(),
                part.getReorderLevel(),
                part.isActive(),
                part.isLowStock(),
                part.getCreatedAt(),
                part.getUpdatedAt()
        );
    }

    private InventoryTransactionResponse
    toTransactionResponse(
            InventoryTransactionEntity transaction
    ) {
        return new InventoryTransactionResponse(
                transaction.getId(),
                transaction.getPart().getId(),
                transaction.getPart().getName(),
                transaction.getServiceRequest() == null
                        ? null
                        : transaction
                        .getServiceRequest()
                        .getId(),
                transaction.getTransactionType(),
                transaction.getQuantity(),
                transaction.getUnitCost(),
                transaction.getNote(),
                transaction.getCreatedByUser().getId(),
                transaction.getCreatedByUser().getName(),
                transaction.getCreatedAt()
        );
    }

    private ServiceRequestPartResponse
    toServiceRequestPartResponse(
            ServiceRequestPartEntity serviceRequestPart
    ) {
        BigDecimal totalCost =
                serviceRequestPart
                        .getUnitCost()
                        .multiply(
                                BigDecimal.valueOf(
                                        serviceRequestPart
                                                .getQuantity()
                                )
                        );

        return new ServiceRequestPartResponse(
                serviceRequestPart.getId(),
                serviceRequestPart
                        .getServiceRequest()
                        .getId(),
                serviceRequestPart.getPart().getId(),
                serviceRequestPart.getPart().getName(),
                serviceRequestPart.getQuantity(),
                serviceRequestPart.getUnitCost(),
                totalCost,
                serviceRequestPart
                        .getAddedByUser()
                        .getId(),
                serviceRequestPart
                        .getAddedByUser()
                        .getName(),
                serviceRequestPart.getCreatedAt()
        );
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
}