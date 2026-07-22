package com.fixonaut.backend.technician;

import com.fixonaut.backend.organization.OrganizationEntity;
import com.fixonaut.backend.user.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "technician_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TechnicianProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private OrganizationEntity organization;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private UserEntity user;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "service_area", length = 200)
    private String serviceArea;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public TechnicianProfileEntity(
            OrganizationEntity organization,
            UserEntity user,
            String phone,
            String skills,
            String serviceArea
    ) {
        this.organization = organization;
        this.user = user;
        this.phone = phone;
        this.skills = skills;
        this.serviceArea = serviceArea;
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

    public void updateDetails(
            String phone,
            String skills,
            String serviceArea
    ) {
        this.phone = phone;
        this.skills = skills;
        this.serviceArea = serviceArea;
    }

    public void deactivate() {
        this.active = false;
    }

    public void activate() {
        this.active = true;
    }
}