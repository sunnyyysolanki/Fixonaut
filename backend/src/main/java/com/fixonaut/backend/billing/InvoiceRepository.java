package com.fixonaut.backend.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository
        extends JpaRepository<InvoiceEntity, UUID> {

    @Query("""
            SELECT invoice
            FROM InvoiceEntity invoice
            WHERE invoice.id = :invoiceId
              AND invoice.organization.id = :organizationId
            """)
    Optional<InvoiceEntity> findByIdAndOrganizationId(
            @Param("invoiceId") UUID invoiceId,
            @Param("organizationId") UUID organizationId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT invoice
            FROM InvoiceEntity invoice
            WHERE invoice.id = :invoiceId
              AND invoice.organization.id = :organizationId
            """)
    Optional<InvoiceEntity>
    findByIdAndOrganizationIdForUpdate(
            @Param("invoiceId") UUID invoiceId,
            @Param("organizationId") UUID organizationId
    );

    @Query("""
            SELECT invoice
            FROM InvoiceEntity invoice
            WHERE invoice.serviceRequest.id = :serviceRequestId
              AND invoice.organization.id = :organizationId
            """)
    Optional<InvoiceEntity>
    findByServiceRequestIdAndOrganizationId(
            @Param("serviceRequestId") UUID serviceRequestId,
            @Param("organizationId") UUID organizationId
    );

    boolean existsByOrganizationIdAndInvoiceNumber(
            UUID organizationId,
            String invoiceNumber
    );
}