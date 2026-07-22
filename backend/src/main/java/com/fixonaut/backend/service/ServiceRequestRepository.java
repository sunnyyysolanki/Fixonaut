package com.fixonaut.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ServiceRequestRepository
        extends JpaRepository<ServiceRequestEntity, UUID> {

    @Query("""
            SELECT request
            FROM ServiceRequestEntity request
            WHERE request.organization.id = :organizationId
              AND (
                    :status IS NULL
                    OR request.status = :status
              )
              AND (
                    :priority IS NULL
                    OR request.priority = :priority
              )
              AND (
                    :search IS NULL
                    OR :search = ''
                    OR LOWER(request.title)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(request.description)
                        LIKE LOWER(CONCAT('%', :search, '%'))
              )
            ORDER BY request.createdAt DESC
            """)
    Page<ServiceRequestEntity> searchByOrganization(
            @Param("organizationId") UUID organizationId,
            @Param("status") ServiceRequestStatus status,
            @Param("priority") ServiceRequestPriority priority,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
            SELECT request
            FROM ServiceRequestEntity request
            WHERE request.id = :requestId
              AND request.organization.id = :organizationId
            """)
    Optional<ServiceRequestEntity> findByIdAndOrganizationId(
            @Param("requestId") UUID requestId,
            @Param("organizationId") UUID organizationId
    );

    @Query("""
            SELECT CASE WHEN COUNT(request) > 0 THEN true ELSE false END
            FROM ServiceRequestEntity request
            WHERE request.id = :requestId
              AND request.organization.id = :organizationId
            """)
    boolean existsByIdAndOrganizationId(
            @Param("requestId") UUID requestId,
            @Param("organizationId") UUID organizationId
    );
}