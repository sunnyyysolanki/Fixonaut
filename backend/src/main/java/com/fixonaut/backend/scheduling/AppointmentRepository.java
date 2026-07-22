package com.fixonaut.backend.scheduling;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppointmentRepository
        extends JpaRepository<AppointmentEntity, UUID> {

    @Query("""
            SELECT appointment
            FROM AppointmentEntity appointment
            WHERE appointment.id = :appointmentId
              AND appointment.organization.id = :organizationId
            """)
    Optional<AppointmentEntity>
    findByIdAndOrganizationId(
            @Param("appointmentId") UUID appointmentId,
            @Param("organizationId") UUID organizationId
    );

    @Query("""
            SELECT appointment
            FROM AppointmentEntity appointment
            WHERE appointment.serviceRequest.id = :serviceRequestId
              AND appointment.organization.id = :organizationId
            """)
    Optional<AppointmentEntity>
    findByServiceRequestIdAndOrganizationId(
            @Param("serviceRequestId") UUID serviceRequestId,
            @Param("organizationId") UUID organizationId
    );

    @Query("""
            SELECT CASE WHEN COUNT(appointment) > 0
                   THEN true
                   ELSE false
                   END
            FROM AppointmentEntity appointment
            WHERE appointment.organization.id = :organizationId
              AND appointment.technician.id = :technicianId
              AND appointment.status IN (
                    com.fixonaut.backend.scheduling.AppointmentStatus.SCHEDULED,
                    com.fixonaut.backend.scheduling.AppointmentStatus.CONFIRMED,
                    com.fixonaut.backend.scheduling.AppointmentStatus.IN_PROGRESS
              )
              AND appointment.startsAt < :endsAt
              AND appointment.endsAt > :startsAt
              AND (
                    :excludedAppointmentId IS NULL
                    OR appointment.id <> :excludedAppointmentId
              )
            """)
    boolean existsConflictingAppointment(
            @Param("organizationId") UUID organizationId,
            @Param("technicianId") UUID technicianId,
            @Param("startsAt") Instant startsAt,
            @Param("endsAt") Instant endsAt,
            @Param("excludedAppointmentId")
            UUID excludedAppointmentId
    );

    @Query("""
        SELECT appointment
        FROM AppointmentEntity appointment
        WHERE appointment.organization.id = :organizationId
          AND appointment.startsAt < :to
          AND appointment.endsAt > :from
          AND (
                :technicianId IS NULL
                OR appointment.technician.id = :technicianId
          )
        ORDER BY appointment.startsAt ASC
        """)
    List<AppointmentEntity> findAppointmentsInRange(
            @Param("organizationId") UUID organizationId,
            @Param("from") Instant from,
            @Param("to") Instant to,
            @Param("technicianId") UUID technicianId
    );
}