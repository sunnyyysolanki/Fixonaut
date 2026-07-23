package com.fixonaut.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ServiceRequestStatusHistoryRepository
        extends JpaRepository<
        ServiceRequestStatusHistoryEntity,
        UUID
        > {

    List<ServiceRequestStatusHistoryEntity>
    findByServiceRequestIdOrderByChangedAtAsc(
            UUID serviceRequestId
    );

    @Query("""
        SELECT history
        FROM ServiceRequestStatusHistoryEntity history
        WHERE history.serviceRequest.organization.id =
              :organizationId
        ORDER BY history.changedAt DESC
        """)
    Page<ServiceRequestStatusHistoryEntity>
    findRecentOrganizationActivity(
            @Param("organizationId") UUID organizationId,
            Pageable pageable
    );
}