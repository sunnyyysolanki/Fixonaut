package com.fixonaut.backend.scheduling;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TechnicianAvailabilityRepository
        extends JpaRepository<
        TechnicianAvailabilityEntity,
        UUID
        > {

    @Query("""
            SELECT availability
            FROM TechnicianAvailabilityEntity availability
            WHERE availability.organization.id = :organizationId
              AND availability.technician.id = :technicianId
              AND availability.active = true
            ORDER BY availability.dayOfWeek,
                     availability.startTime
            """)
    List<TechnicianAvailabilityEntity>
    findActiveAvailability(
            @Param("organizationId") UUID organizationId,
            @Param("technicianId") UUID technicianId
    );

    @Query("""
            SELECT availability
            FROM TechnicianAvailabilityEntity availability
            WHERE availability.id = :availabilityId
              AND availability.organization.id = :organizationId
            """)
    java.util.Optional<TechnicianAvailabilityEntity>
    findByIdAndOrganizationId(
            @Param("availabilityId") UUID availabilityId,
            @Param("organizationId") UUID organizationId
    );
}