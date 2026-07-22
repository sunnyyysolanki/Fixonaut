package com.fixonaut.backend.inventory;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PartRepository
        extends JpaRepository<PartEntity, UUID> {

    @Query("""
            SELECT part
            FROM PartEntity part
            WHERE part.organization.id = :organizationId
              AND part.active = true
              AND (
                    :search IS NULL
                    OR :search = ''
                    OR LOWER(part.name)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(part.sku)
                        LIKE LOWER(CONCAT('%', :search, '%'))
              )
            ORDER BY part.name ASC
            """)
    Page<PartEntity> searchActiveParts(
            @Param("organizationId") UUID organizationId,
            @Param("search") String search,
            Pageable pageable
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT part
            FROM PartEntity part
            WHERE part.id = :partId
              AND part.organization.id = :organizationId
            """)
    Optional<PartEntity> findByIdAndOrganizationIdForUpdate(
            @Param("partId") UUID partId,
            @Param("organizationId") UUID organizationId
    );

    @Query("""
            SELECT part
            FROM PartEntity part
            WHERE part.id = :partId
              AND part.organization.id = :organizationId
            """)
    Optional<PartEntity> findByIdAndOrganizationId(
            @Param("partId") UUID partId,
            @Param("organizationId") UUID organizationId
    );

    boolean existsByOrganizationIdAndSku(
            UUID organizationId,
            String sku
    );
}