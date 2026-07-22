package com.fixonaut.backend.billing;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/quotes")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER'
            )
            """)
    public ResponseEntity<QuoteResponse> createQuote(
            @Valid @RequestBody CreateQuoteRequest request
    ) {
        QuoteResponse response =
                billingService.createQuote(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{quoteId}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(response);
    }

    @GetMapping("/quotes/{quoteId}")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<QuoteResponse> getQuote(
            @PathVariable UUID quoteId
    ) {
        return ResponseEntity.ok(
                billingService.getQuote(quoteId)
        );
    }

    @PostMapping("/quotes/{quoteId}/send")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER'
            )
            """)
    public ResponseEntity<QuoteResponse> sendQuote(
            @PathVariable UUID quoteId
    ) {
        return ResponseEntity.ok(
                billingService.sendQuote(quoteId)
        );
    }

    @PostMapping("/quotes/{quoteId}/approve")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER'
            )
            """)
    public ResponseEntity<QuoteResponse> approveQuote(
            @PathVariable UUID quoteId
    ) {
        return ResponseEntity.ok(
                billingService.approveQuote(quoteId)
        );
    }

    @PostMapping("/quotes/{quoteId}/reject")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER'
            )
            """)
    public ResponseEntity<QuoteResponse> rejectQuote(
            @PathVariable UUID quoteId
    ) {
        return ResponseEntity.ok(
                billingService.rejectQuote(quoteId)
        );
    }

    @PostMapping("/invoices")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER'
            )
            """)
    public ResponseEntity<InvoiceResponse> createInvoice(
            @Valid @RequestBody CreateInvoiceRequest request
    ) {
        InvoiceResponse response =
                billingService.createInvoice(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{invoiceId}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(response);
    }

    @GetMapping("/invoices/{invoiceId}")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<InvoiceResponse> getInvoice(
            @PathVariable UUID invoiceId
    ) {
        return ResponseEntity.ok(
                billingService.getInvoice(invoiceId)
        );
    }

    @PostMapping("/invoices/{invoiceId}/issue")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER'
            )
            """)
    public ResponseEntity<InvoiceResponse> issueInvoice(
            @PathVariable UUID invoiceId
    ) {
        return ResponseEntity.ok(
                billingService.issueInvoice(invoiceId)
        );
    }

    @PostMapping("/invoices/{invoiceId}/cancel")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN'
            )
            """)
    public ResponseEntity<InvoiceResponse> cancelInvoice(
            @PathVariable UUID invoiceId
    ) {
        return ResponseEntity.ok(
                billingService.cancelInvoice(invoiceId)
        );
    }

    @PostMapping("/invoices/{invoiceId}/payments")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER'
            )
            """)
    public ResponseEntity<InvoiceResponse> recordPayment(
            @PathVariable UUID invoiceId,
            @Valid @RequestBody RecordPaymentRequest request
    ) {
        return ResponseEntity.ok(
                billingService.recordPayment(
                        invoiceId,
                        request
                )
        );
    }
}