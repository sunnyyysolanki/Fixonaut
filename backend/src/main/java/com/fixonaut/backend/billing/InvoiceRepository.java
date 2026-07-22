package com.fixonaut.backend.billing;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query("""
        SELECT invoice
        FROM InvoiceEntity invoice
        WHERE invoice.organization.id = :organizationId
          AND (
                :status IS NULL
                OR invoice.status = :status
          )
          AND (
                :paymentStatus IS NULL
                OR invoice.paymentStatus = :paymentStatus
          )
          AND (
                :search IS NULL
                OR :search = ''
                OR LOWER(invoice.invoiceNumber)
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(invoice.serviceRequest.title)
                    LIKE LOWER(CONCAT('%', :search, '%'))
          )
        ORDER BY invoice.createdAt DESC
        """)
    Page<InvoiceEntity> searchByOrganization(
            @Param("organizationId") UUID organizationId,
            @Param("status") InvoiceStatus status,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("search") String search,
            Pageable pageable
    );
}