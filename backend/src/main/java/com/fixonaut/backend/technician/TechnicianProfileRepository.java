package com.fixonaut.backend.technician;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface TechnicianProfileRepository
        extends JpaRepository<
        TechnicianProfileEntity,
        UUID
        > {

    @Query("""
            SELECT technician
            FROM TechnicianProfileEntity technician
            WHERE technician.organization.id = :organizationId
              AND technician.active = true
              AND (
                    :search IS NULL
                    OR :search = ''
                    OR LOWER(technician.user.name)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(technician.serviceArea)
                        LIKE LOWER(CONCAT('%', :search, '%'))
              )
            ORDER BY technician.createdAt DESC
            """)
    Page<TechnicianProfileEntity> searchActiveTechnicians(
            @Param("organizationId") UUID organizationId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
            SELECT technician
            FROM TechnicianProfileEntity technician
            WHERE technician.id = :technicianId
              AND technician.organization.id = :organizationId
            """)
    Optional<TechnicianProfileEntity>
    findByIdAndOrganizationId(
            @Param("technicianId") UUID technicianId,
            @Param("organizationId") UUID organizationId
    );

    @Query("""
            SELECT technician
            FROM TechnicianProfileEntity technician
            WHERE technician.user.id = :userId
              AND technician.organization.id = :organizationId
            """)
    Optional<TechnicianProfileEntity>
    findByUserIdAndOrganizationId(
            @Param("userId") UUID userId,
            @Param("organizationId") UUID organizationId
    );

    boolean existsByUserId(UUID userId);
}