package com.fixonaut.backend.inventory;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inventory_transactions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InventoryTransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private OrganizationEntity organization;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "part_id", nullable = false)
    private PartEntity part;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_request_id")
    private ServiceRequestEntity serviceRequest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private UserEntity createdByUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 30)
    private InventoryTransactionType transactionType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitCost;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public InventoryTransactionEntity(
            OrganizationEntity organization,
            PartEntity part,
            ServiceRequestEntity serviceRequest,
            UserEntity createdByUser,
            InventoryTransactionType transactionType,
            Integer quantity,
            BigDecimal unitCost,
            String note
    ) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Transaction quantity must be greater than zero"
            );
        }

        if (unitCost == null || unitCost.signum() < 0) {
            throw new IllegalArgumentException(
                    "Transaction unit cost cannot be negative"
            );
        }

        this.organization = organization;
        this.part = part;
        this.serviceRequest = serviceRequest;
        this.createdByUser = createdByUser;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.unitCost = unitCost;
        this.note = note;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}