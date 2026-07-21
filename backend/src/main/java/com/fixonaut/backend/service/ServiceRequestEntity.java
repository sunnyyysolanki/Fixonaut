package com.fixonaut.backend.service;

import com.fixonaut.backend.customer.CustomerEntity;
import com.fixonaut.backend.organization.OrganizationEntity;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "service_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ServiceRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private OrganizationEntity organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private CustomerEntity customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id")
    private UserEntity assignedTechnician;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ServiceRequestPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ServiceRequestStatus status;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Version
    @Column(nullable = false)
    private Long version;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public ServiceRequestEntity(
            OrganizationEntity organization,
            CustomerEntity customer,
            String title,
            String description,
            ServiceRequestPriority priority,
            Instant scheduledAt
    ) {
        this.organization = organization;
        this.customer = customer;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = ServiceRequestStatus.NEW;
        this.scheduledAt = scheduledAt;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.priority == null) {
            this.priority = ServiceRequestPriority.NORMAL;
        }

        if (this.status == null) {
            this.status = ServiceRequestStatus.NEW;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void assignTechnician(UserEntity technician) {
        if (status != ServiceRequestStatus.NEW) {
            throw new IllegalStateException(
                    "Only new requests can be assigned"
            );
        }

        this.assignedTechnician = technician;
        this.status = ServiceRequestStatus.ASSIGNED;
    }

    public void accept() {
        transitionTo(ServiceRequestStatus.ACCEPTED);
    }

    public void start() {
        transitionTo(ServiceRequestStatus.IN_PROGRESS);
    }

    public void waitForPart() {
        transitionTo(ServiceRequestStatus.WAITING_FOR_PART);
    }

    public void complete() {
        transitionTo(ServiceRequestStatus.COMPLETED);
    }

    public void cancel() {
        if (status == ServiceRequestStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Completed requests cannot be cancelled"
            );
        }

        if (status == ServiceRequestStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Request is already cancelled"
            );
        }

        this.status = ServiceRequestStatus.CANCELLED;
    }

    public void updateRequest(
            String title,
            String description,
            ServiceRequestPriority priority,
            Instant scheduledAt
    ) {
        if (status == ServiceRequestStatus.COMPLETED
                || status == ServiceRequestStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Completed or cancelled requests cannot be edited"
            );
        }

        this.title = title;
        this.description = description;
        this.priority = priority;
        this.scheduledAt = scheduledAt;
    }

    private void transitionTo(ServiceRequestStatus targetStatus) {
        if (!canTransitionTo(targetStatus)) {
            throw new IllegalStateException(
                    "Invalid service request transition from "
                            + status
                            + " to "
                            + targetStatus
            );
        }

        this.status = targetStatus;
    }

    private boolean canTransitionTo(
            ServiceRequestStatus targetStatus
    ) {
        return switch (status) {
            case NEW -> targetStatus == ServiceRequestStatus.CANCELLED;

            case ASSIGNED -> targetStatus == ServiceRequestStatus.ACCEPTED
                    || targetStatus == ServiceRequestStatus.CANCELLED;

            case ACCEPTED -> targetStatus == ServiceRequestStatus.IN_PROGRESS
                    || targetStatus == ServiceRequestStatus.CANCELLED;

            case IN_PROGRESS ->
                    targetStatus == ServiceRequestStatus.COMPLETED
                            || targetStatus
                            == ServiceRequestStatus.WAITING_FOR_PART
                            || targetStatus
                            == ServiceRequestStatus.CANCELLED;

            case WAITING_FOR_PART ->
                    targetStatus == ServiceRequestStatus.IN_PROGRESS
                            || targetStatus
                            == ServiceRequestStatus.CANCELLED;

            case COMPLETED, CANCELLED -> false;
        };
    }
}