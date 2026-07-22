package com.fixonaut.backend.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface QuoteRepository
        extends JpaRepository<QuoteEntity, UUID> {

    @Query("""
            SELECT quote
            FROM QuoteEntity quote
            WHERE quote.id = :quoteId
              AND quote.organization.id = :organizationId
            """)
    Optional<QuoteEntity> findByIdAndOrganizationId(
            @Param("quoteId") UUID quoteId,
            @Param("organizationId") UUID organizationId
    );

    @Query("""
            SELECT quote
            FROM QuoteEntity quote
            WHERE quote.serviceRequest.id = :serviceRequestId
              AND quote.organization.id = :organizationId
            ORDER BY quote.createdAt DESC
            """)
    Optional<QuoteEntity>
    findLatestByServiceRequestAndOrganization(
            @Param("serviceRequestId") UUID serviceRequestId,
            @Param("organizationId") UUID organizationId
    );

    boolean existsByOrganizationIdAndQuoteNumber(
            UUID organizationId,
            String quoteNumber
    );
}