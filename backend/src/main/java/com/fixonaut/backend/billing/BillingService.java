package com.fixonaut.backend.billing;

import com.fixonaut.backend.common.exception.ConflictException;
import com.fixonaut.backend.common.exception.ResourceNotFoundException;
import com.fixonaut.backend.organization.OrganizationEntity;
import com.fixonaut.backend.organization.OrganizationRepository;
import com.fixonaut.backend.security.AuthenticatedUserContext;
import com.fixonaut.backend.service.ServiceRequestEntity;
import com.fixonaut.backend.service.ServiceRequestRepository;
import com.fixonaut.backend.user.UserEntity;
import com.fixonaut.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final QuoteRepository quoteRepository;
    private final InvoiceRepository invoiceRepository;
    private final OrganizationRepository organizationRepository;
    private final ServiceRequestRepository
            serviceRequestRepository;
    private final UserRepository userRepository;
    private final AuthenticatedUserContext
            authenticatedUserContext;

    @Transactional
    public QuoteResponse createQuote(
            CreateQuoteRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        OrganizationEntity organization =
                findOrganization(organizationId);

        ServiceRequestEntity serviceRequest =
                findServiceRequest(
                        request.serviceRequestId(),
                        organizationId
                );

        UserEntity currentUser = getCurrentUser();

        String quoteNumber =
                generateDocumentNumber("Q");

        QuoteEntity quote = new QuoteEntity(
                organization,
                serviceRequest,
                currentUser,
                quoteNumber,
                request.validUntil(),
                normalizeNullable(request.notes())
        );

        for (QuoteItemRequest item : request.items()) {
            quote.addItem(
                    item.itemType(),
                    normalizeRequired(item.description()),
                    item.quantity(),
                    item.unitPrice()
            );
        }

        quote.applyAmounts(
                amountOrZero(request.discountAmount()),
                amountOrZero(request.taxAmount())
        );

        return toQuoteResponse(
                quoteRepository.save(quote)
        );
    }

    @Transactional(readOnly = true)
    public QuoteResponse getQuote(UUID quoteId) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        return toQuoteResponse(
                findQuote(quoteId, organizationId)
        );
    }

    @Transactional
    public QuoteResponse sendQuote(UUID quoteId) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        QuoteEntity quote =
                findQuote(quoteId, organizationId);

        quote.send();

        return toQuoteResponse(quote);
    }

    @Transactional
    public QuoteResponse approveQuote(UUID quoteId) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        QuoteEntity quote =
                findQuote(quoteId, organizationId);

        quote.approve();

        return toQuoteResponse(quote);
    }

    @Transactional
    public QuoteResponse rejectQuote(UUID quoteId) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        QuoteEntity quote =
                findQuote(quoteId, organizationId);

        quote.reject();

        return toQuoteResponse(quote);
    }

    @Transactional
    public InvoiceResponse createInvoice(
            CreateInvoiceRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        OrganizationEntity organization =
                findOrganization(organizationId);

        ServiceRequestEntity serviceRequest =
                findServiceRequest(
                        request.serviceRequestId(),
                        organizationId
                );

        QuoteEntity quote = null;

        if (request.quoteId() != null) {
            quote = findQuote(
                    request.quoteId(),
                    organizationId
            );

            if (quote.getStatus() != QuoteStatus.APPROVED) {
                throw new ConflictException(
                        "QUOTE_NOT_APPROVED",
                        "Only approved quotes can be invoiced"
                );
            }
        }

        if (invoiceRepository
                .findByServiceRequestIdAndOrganizationId(
                        request.serviceRequestId(),
                        organizationId
                )
                .isPresent()) {
            throw new ConflictException(
                    "INVOICE_ALREADY_EXISTS",
                    "This service request already has an invoice"
            );
        }

        UserEntity currentUser = getCurrentUser();

        InvoiceEntity invoice = new InvoiceEntity(
                organization,
                serviceRequest,
                quote,
                currentUser,
                generateDocumentNumber("INV"),
                normalizeNullable(request.notes())
        );

        for (InvoiceItemRequest item : request.items()) {
            invoice.addItem(
                    item.itemType(),
                    normalizeRequired(item.description()),
                    item.quantity(),
                    item.unitPrice()
            );
        }

        invoice.applyAmounts(
                amountOrZero(request.discountAmount()),
                amountOrZero(request.taxAmount())
        );

        return toInvoiceResponse(
                invoiceRepository.save(invoice)
        );
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(UUID invoiceId) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        return toInvoiceResponse(
                findInvoice(invoiceId, organizationId)
        );
    }

    @Transactional
    public InvoiceResponse issueInvoice(UUID invoiceId) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        InvoiceEntity invoice =
                findInvoice(invoiceId, organizationId);

        invoice.issue();

        return toInvoiceResponse(invoice);
    }

    @Transactional
    public InvoiceResponse cancelInvoice(UUID invoiceId) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        InvoiceEntity invoice =
                findInvoice(invoiceId, organizationId);

        invoice.cancel();

        return toInvoiceResponse(invoice);
    }

    @Transactional
    public InvoiceResponse recordPayment(
            UUID invoiceId,
            RecordPaymentRequest request
    ) {
        UUID organizationId =
                authenticatedUserContext.getCurrentOrganizationId();

        InvoiceEntity invoice =
                invoiceRepository
                        .findByIdAndOrganizationIdForUpdate(
                                invoiceId,
                                organizationId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invoice not found"
                                )
                        );

        invoice.recordPayment(request.amount());

        return toInvoiceResponse(invoice);
    }

    private OrganizationEntity findOrganization(
            UUID organizationId
    ) {
        return organizationRepository
                .findById(organizationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Organization not found"
                        )
                );
    }

    private ServiceRequestEntity findServiceRequest(
            UUID serviceRequestId,
            UUID organizationId
    ) {
        return serviceRequestRepository
                .findByIdAndOrganizationId(
                        serviceRequestId,
                        organizationId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Service request not found"
                        )
                );
    }

    private QuoteEntity findQuote(
            UUID quoteId,
            UUID organizationId
    ) {
        return quoteRepository
                .findByIdAndOrganizationId(
                        quoteId,
                        organizationId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Quote not found"
                        )
                );
    }

    private InvoiceEntity findInvoice(
            UUID invoiceId,
            UUID organizationId
    ) {
        return invoiceRepository
                .findByIdAndOrganizationId(
                        invoiceId,
                        organizationId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Invoice not found"
                        )
                );
    }

    private UserEntity getCurrentUser() {
        UUID currentUserId =
                authenticatedUserContext.getCurrentUserId();

        return userRepository
                .findById(currentUserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Current user not found"
                        )
                );
    }

    private QuoteResponse toQuoteResponse(
            QuoteEntity quote
    ) {
        return new QuoteResponse(
                quote.getId(),
                quote.getQuoteNumber(),
                quote.getServiceRequest().getId(),
                quote.getStatus(),
                quote.getCurrency(),
                quote.getSubtotal(),
                quote.getDiscountAmount(),
                quote.getTaxAmount(),
                quote.getTotalAmount(),
                quote.getValidUntil(),
                quote.getNotes(),
                quote.getItems()
                        .stream()
                        .map(this::toQuoteItemResponse)
                        .toList(),
                quote.getCreatedAt(),
                quote.getUpdatedAt()
        );
    }

    private QuoteItemResponse toQuoteItemResponse(
            QuoteItemEntity item
    ) {
        return new QuoteItemResponse(
                item.getId(),
                item.getItemType(),
                item.getDescription(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getLineTotal()
        );
    }

    private InvoiceResponse toInvoiceResponse(
            InvoiceEntity invoice
    ) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getServiceRequest().getId(),
                invoice.getQuote() == null
                        ? null
                        : invoice.getQuote().getId(),
                invoice.getStatus(),
                invoice.getPaymentStatus(),
                invoice.getCurrency(),
                invoice.getSubtotal(),
                invoice.getDiscountAmount(),
                invoice.getTaxAmount(),
                invoice.getTotalAmount(),
                invoice.getAmountPaid(),
                invoice.getNotes(),
                invoice.getItems()
                        .stream()
                        .map(this::toInvoiceItemResponse)
                        .toList(),
                invoice.getIssuedAt(),
                invoice.getPaidAt(),
                invoice.getCreatedAt(),
                invoice.getUpdatedAt()
        );
    }

    private InvoiceItemResponse toInvoiceItemResponse(
            InvoiceItemEntity item
    ) {
        return new InvoiceItemResponse(
                item.getId(),
                item.getItemType(),
                item.getDescription(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getLineTotal()
        );
    }

    private String generateDocumentNumber(
            String prefix
    ) {
        String date = LocalDate.now()
                .toString()
                .replace("-", "");

        String suffix = UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();

        return prefix + "-" + date + "-" + suffix;
    }

    private BigDecimal amountOrZero(BigDecimal amount) {
        return amount == null
                ? BigDecimal.ZERO
                : amount;
    }

    private String normalizeRequired(String value) {
        return value.trim();
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        return normalized.isBlank() ? null : normalized;
    }
}