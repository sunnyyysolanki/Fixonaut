package com.fixonaut.backend.inventory;

import com.fixonaut.backend.organization.OrganizationEntity;
import com.fixonaut.backend.service.ServiceRequestEntity;
import com.fixonaut.backend.user.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "service_request_parts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ServiceRequestPartEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private OrganizationEntity organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_request_id", nullable = false)
    private ServiceRequestEntity serviceRequest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "part_id", nullable = false)
    private PartEntity part;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitCost;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "added_by_user_id", nullable = false)
    private UserEntity addedByUser;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public ServiceRequestPartEntity(
            OrganizationEntity organization,
            ServiceRequestEntity serviceRequest,
            PartEntity part,
            Integer quantity,
            BigDecimal unitCost,
            UserEntity addedByUser
    ) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Part quantity must be greater than zero"
            );
        }

        if (unitCost == null || unitCost.signum() < 0) {
            throw new IllegalArgumentException(
                    "Part unit cost cannot be negative"
            );
        }

        this.organization = organization;
        this.serviceRequest = serviceRequest;
        this.part = part;
        this.quantity = quantity;
        this.unitCost = unitCost;
        this.addedByUser = addedByUser;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}