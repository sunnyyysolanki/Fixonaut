package com.fixonaut.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceRequestPartRepository
        extends JpaRepository<
        ServiceRequestPartEntity,
        UUID
        > {

    List<ServiceRequestPartEntity>
    findByServiceRequestIdAndOrganizationIdOrderByCreatedAtAsc(
            UUID serviceRequestId,
            UUID organizationId
    );
}