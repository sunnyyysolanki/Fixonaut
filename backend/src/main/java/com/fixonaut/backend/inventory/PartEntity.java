package com.fixonaut.backend.inventory;

import com.fixonaut.backend.organization.OrganizationEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "parts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PartEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private OrganizationEntity organization;

    @Column(nullable = false, length = 80)
    private String sku;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false, length = 30)
    private String unit = "piece";

    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand = 0;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 0;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public PartEntity(
            OrganizationEntity organization,
            String sku,
            String name,
            String unit,
            Integer reorderLevel
    ) {
        this.organization = organization;
        this.sku = sku;
        this.name = name;
        this.unit = unit == null || unit.isBlank()
                ? "piece"
                : unit;
        this.quantityOnHand = 0;
        this.reorderLevel = reorderLevel == null
                ? 0
                : reorderLevel;
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void increaseStock(int quantity) {
        validatePositiveQuantity(quantity);

        this.quantityOnHand += quantity;
    }

    public void decreaseStock(int quantity) {
        validatePositiveQuantity(quantity);

        if (this.quantityOnHand < quantity) {
            throw new IllegalStateException(
                    "Insufficient stock for part: " + this.name
            );
        }

        this.quantityOnHand -= quantity;
    }

    public void adjustStock(int newQuantity) {
        if (newQuantity < 0) {
            throw new IllegalArgumentException(
                    "Stock quantity cannot be negative"
            );
        }

        this.quantityOnHand = newQuantity;
    }

    public void updateDetails(
            String sku,
            String name,
            String unit,
            Integer reorderLevel
    ) {
        this.sku = sku;
        this.name = name;
        this.unit = unit;
        this.reorderLevel = reorderLevel;
    }

    public void deactivate() {
        this.active = false;
    }

    public void activate() {
        this.active = true;
    }

    public boolean isLowStock() {
        return quantityOnHand <= reorderLevel;
    }

    private void validatePositiveQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero"
            );
        }
    }
}