package com.fixonaut.backend.scheduling;

import com.fixonaut.backend.organization.OrganizationEntity;
import com.fixonaut.backend.service.ServiceRequestEntity;
import com.fixonaut.backend.user.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AppointmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private OrganizationEntity organization;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "service_request_id",
            nullable = false,
            unique = true
    )
    private ServiceRequestEntity serviceRequest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "technician_user_id", nullable = false)
    private UserEntity technician;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AppointmentStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public AppointmentEntity(
            OrganizationEntity organization,
            ServiceRequestEntity serviceRequest,
            UserEntity technician,
            Instant startsAt,
            Instant endsAt,
            String notes
    ) {
        validateTimeRange(startsAt, endsAt);

        this.organization = organization;
        this.serviceRequest = serviceRequest;
        this.technician = technician;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.status = AppointmentStatus.SCHEDULED;
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = AppointmentStatus.SCHEDULED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void confirm() {
        requireStatus(
                AppointmentStatus.SCHEDULED,
                "Only scheduled appointments can be confirmed"
        );

        this.status = AppointmentStatus.CONFIRMED;
    }

    public void start() {
        requireStatus(
                AppointmentStatus.CONFIRMED,
                "Only confirmed appointments can start"
        );

        this.status = AppointmentStatus.IN_PROGRESS;
    }

    public void complete() {
        requireStatus(
                AppointmentStatus.IN_PROGRESS,
                "Only active appointments can be completed"
        );

        this.status = AppointmentStatus.COMPLETED;
    }

    public void cancel() {
        if (status == AppointmentStatus.COMPLETED
                || status == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException(
                    "This appointment cannot be cancelled"
            );
        }

        this.status = AppointmentStatus.CANCELLED;
    }

    public void markNoShow() {
        if (status != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Only confirmed appointments can be marked no-show"
            );
        }

        this.status = AppointmentStatus.NO_SHOW;
    }

    public void updateTime(
            Instant startsAt,
            Instant endsAt
    ) {
        if (status == AppointmentStatus.COMPLETED
                || status == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Completed or cancelled appointments cannot be rescheduled"
            );
        }

        validateTimeRange(startsAt, endsAt);

        this.startsAt = startsAt;
        this.endsAt = endsAt;
    }

    private void requireStatus(
            AppointmentStatus expected,
            String message
    ) {
        if (status != expected) {
            throw new IllegalStateException(message);
        }
    }

    private void validateTimeRange(
            Instant startsAt,
            Instant endsAt
    ) {
        if (startsAt == null || endsAt == null) {
            throw new IllegalArgumentException(
                    "Appointment times are required"
            );
        }

        if (!startsAt.isBefore(endsAt)) {
            throw new IllegalArgumentException(
                    "Appointment start must be before appointment end"
            );
        }
    }
}