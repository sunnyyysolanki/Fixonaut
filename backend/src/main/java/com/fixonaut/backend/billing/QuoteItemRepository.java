package com.fixonaut.backend.billing;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuoteItemRepository
        extends JpaRepository<QuoteItemEntity, UUID> {

    List<QuoteItemEntity>
    findByQuoteIdOrderByCreatedAtAsc(UUID quoteId);
}