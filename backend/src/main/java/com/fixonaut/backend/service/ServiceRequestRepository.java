package com.fixonaut.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
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

    long countByOrganizationIdAndStatusIn(
            UUID organizationId,
            Collection<ServiceRequestStatus> statuses
    );
    @Query("""
        SELECT COUNT(request)
        FROM ServiceRequestEntity request
        WHERE request.organization.id = :organizationId
          AND request.status = com.fixonaut.backend.service.ServiceRequestStatus.ASSIGNED
          AND request.scheduledAt >= :start
          AND request.scheduledAt < :end
        """)
    long countAssignedToday(
            @Param("organizationId") UUID organizationId,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("""
        SELECT COUNT(request)
        FROM ServiceRequestEntity request
        WHERE request.organization.id = :organizationId
          AND request.status = com.fixonaut.backend.service.ServiceRequestStatus.COMPLETED
          AND request.updatedAt >= :start
          AND request.updatedAt < :end
        """)
    long countCompletedBetween(
            @Param("organizationId") UUID organizationId,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("""
        SELECT request.status, COUNT(request)
        FROM ServiceRequestEntity request
        WHERE request.organization.id = :organizationId
        GROUP BY request.status
        ORDER BY request.status
        """)
    List<Object[]> countByStatus(
            @Param("organizationId") UUID organizationId
    );
}