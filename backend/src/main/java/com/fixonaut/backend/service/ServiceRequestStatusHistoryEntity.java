package com.fixonaut.backend.service;

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
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "service_request_status_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ServiceRequestStatusHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_request_id", nullable = false)
    private ServiceRequestEntity serviceRequest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "changed_by_user_id", nullable = false)
    private UserEntity changedByUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 30)
    private ServiceRequestStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 30)
    private ServiceRequestStatus toStatus;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    public ServiceRequestStatusHistoryEntity(
            ServiceRequestEntity serviceRequest,
            UserEntity changedByUser,
            ServiceRequestStatus fromStatus,
            ServiceRequestStatus toStatus,
            String note
    ) {
        this.serviceRequest = serviceRequest;
        this.changedByUser = changedByUser;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.note = note;
    }

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) {
            changedAt = Instant.now();
        }
    }
}