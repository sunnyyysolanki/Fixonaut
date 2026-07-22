package com.fixonaut.backend.billing;

import com.fixonaut.backend.organization.OrganizationEntity;
import com.fixonaut.backend.service.ServiceRequestEntity;
import com.fixonaut.backend.user.UserEntity;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quotes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuoteEntity {

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
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private UserEntity createdByUser;

    @Column(name = "quote_number", nullable = false, length = 50)
    private String quoteNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private QuoteStatus status = QuoteStatus.DRAFT;

    @Column(nullable = false, length = 3)
    private String currency = "INR";

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(
            mappedBy = "quote",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<QuoteItemEntity> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public QuoteEntity(
            OrganizationEntity organization,
            ServiceRequestEntity serviceRequest,
            UserEntity createdByUser,
            String quoteNumber,
            LocalDate validUntil,
            String notes
    ) {
        this.organization = organization;
        this.serviceRequest = serviceRequest;
        this.createdByUser = createdByUser;
        this.quoteNumber = quoteNumber;
        this.validUntil = validUntil;
        this.notes = notes;
    }

    public void addItem(
            BillingItemType itemType,
            String description,
            BigDecimal quantity,
            BigDecimal unitPrice
    ) {
        QuoteItemEntity item = new QuoteItemEntity(
                this,
                itemType,
                description,
                quantity,
                unitPrice
        );

        items.add(item);
        recalculateTotals();
    }

    public void applyAmounts(
            BigDecimal discountAmount,
            BigDecimal taxAmount
    ) {
        this.discountAmount =
                requireNonNegative(discountAmount);

        this.taxAmount =
                requireNonNegative(taxAmount);

        recalculateTotals();
    }

    public void send() {
        requireStatus(
                QuoteStatus.DRAFT,
                "Only draft quotes can be sent"
        );

        this.status = QuoteStatus.SENT;
    }

    public void approve() {
        requireStatus(
                QuoteStatus.SENT,
                "Only sent quotes can be approved"
        );

        this.status = QuoteStatus.APPROVED;
    }

    public void reject() {
        requireStatus(
                QuoteStatus.SENT,
                "Only sent quotes can be rejected"
        );

        this.status = QuoteStatus.REJECTED;
    }

    public void expire() {
        if (status != QuoteStatus.SENT) {
            throw new IllegalStateException(
                    "Only sent quotes can expire"
            );
        }

        this.status = QuoteStatus.EXPIRED;
    }

    private void recalculateTotals() {
        subtotal = items.stream()
                .map(QuoteItemEntity::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        totalAmount = subtotal
                .subtract(discountAmount)
                .add(taxAmount);

        if (totalAmount.signum() < 0) {
            throw new IllegalStateException(
                    "Quote total cannot be negative"
            );
        }
    }

    private void requireStatus(
            QuoteStatus expected,
            String message
    ) {
        if (status != expected) {
            throw new IllegalStateException(message);
        }
    }

    private BigDecimal requireNonNegative(
            BigDecimal value
    ) {
        if (value == null || value.signum() < 0) {
            throw new IllegalArgumentException(
                    "Amount cannot be negative"
            );
        }

        return value;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}