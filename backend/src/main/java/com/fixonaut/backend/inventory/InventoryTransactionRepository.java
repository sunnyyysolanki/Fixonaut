package com.fixonaut.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InventoryTransactionRepository
        extends JpaRepository<
        InventoryTransactionEntity,
        UUID
        > {

    List<InventoryTransactionEntity>
    findByPartIdAndOrganizationIdOrderByCreatedAtDesc(
            UUID partId,
            UUID organizationId
    );

    List<InventoryTransactionEntity>
    findByServiceRequestIdAndOrganizationIdOrderByCreatedAtDesc(
            UUID serviceRequestId,
            UUID organizationId
    );
}