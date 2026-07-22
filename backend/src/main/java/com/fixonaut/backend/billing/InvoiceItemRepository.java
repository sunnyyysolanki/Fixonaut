package com.fixonaut.backend.billing;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InvoiceItemRepository
        extends JpaRepository<InvoiceItemEntity, UUID> {

    List<InvoiceItemEntity>
    findByInvoiceIdOrderByCreatedAtAsc(UUID invoiceId);
}