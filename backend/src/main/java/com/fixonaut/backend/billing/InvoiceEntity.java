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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InvoiceEntity {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_id")
    private QuoteEntity quote;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private UserEntity createdByUser;

    @Column(name = "invoice_number", nullable = false, length = 50)
    private String invoiceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

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

    @Column(name = "amount_paid", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "issued_at")
    private Instant issuedAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(
            mappedBy = "invoice",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<InvoiceItemEntity> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public InvoiceEntity(
            OrganizationEntity organization,
            ServiceRequestEntity serviceRequest,
            QuoteEntity quote,
            UserEntity createdByUser,
            String invoiceNumber,
            String notes
    ) {
        this.organization = organization;
        this.serviceRequest = serviceRequest;
        this.quote = quote;
        this.createdByUser = createdByUser;
        this.invoiceNumber = invoiceNumber;
        this.notes = notes;
    }

    public void addItem(
            BillingItemType itemType,
            String description,
            BigDecimal quantity,
            BigDecimal unitPrice
    ) {
        InvoiceItemEntity item = new InvoiceItemEntity(
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

    public void issue() {
        if (status != InvoiceStatus.DRAFT) {
            throw new IllegalStateException(
                    "Only draft invoices can be issued"
            );
        }

        status = InvoiceStatus.ISSUED;
        issuedAt = Instant.now();
    }

    public void cancel() {
        if (status == InvoiceStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Invoice is already cancelled"
            );
        }

        if (paymentStatus == PaymentStatus.PAID) {
            throw new IllegalStateException(
                    "Paid invoices cannot be cancelled"
            );
        }

        status = InvoiceStatus.CANCELLED;
    }

    public void recordPayment(BigDecimal amount) {
        if (status != InvoiceStatus.ISSUED) {
            throw new IllegalStateException(
                    "Only issued invoices can receive payments"
            );
        }

        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero"
            );
        }

        BigDecimal newAmountPaid =
                amountPaid.add(amount);

        if (newAmountPaid.compareTo(totalAmount) > 0) {
            throw new IllegalArgumentException(
                    "Payment cannot exceed invoice total"
            );
        }

        amountPaid = newAmountPaid;

        if (amountPaid.compareTo(totalAmount) == 0) {
            paymentStatus = PaymentStatus.PAID;
            paidAt = Instant.now();
        } else {
            paymentStatus = PaymentStatus.PARTIALLY_PAID;
        }
    }

    private void recalculateTotals() {
        subtotal = items.stream()
                .map(InvoiceItemEntity::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        totalAmount = subtotal
                .subtract(discountAmount)
                .add(taxAmount);

        if (totalAmount.signum() < 0) {
            throw new IllegalStateException(
                    "Invoice total cannot be negative"
            );
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