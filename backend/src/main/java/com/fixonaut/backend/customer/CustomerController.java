package com.fixonaut.backend.customer;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DISPATCHER')")
    public ResponseEntity<CustomerResponse> create(
            @Valid @RequestBody CreateCustomerRequest request
    ) {
        CustomerResponse response =
                customerService.create(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{customerId}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(response);
    }

    @GetMapping
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<Page<CustomerResponse>> search(
            @RequestParam(required = false) String search,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {
        Page<CustomerResponse> response =
                customerService.search(search, pageable);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{customerId}")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<CustomerResponse> getById(
            @PathVariable UUID customerId
    ) {
        return ResponseEntity.ok(
                customerService.getById(customerId)
        );
    }

    @PatchMapping("/{customerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DISPATCHER')")
    public ResponseEntity<CustomerResponse> update(
            @PathVariable UUID customerId,
            @Valid @RequestBody UpdateCustomerRequest request
    ) {
        return ResponseEntity.ok(
                customerService.update(customerId, request)
        );
    }

    @PatchMapping("/{customerId}/deactivate")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DISPATCHER')")
    public ResponseEntity<CustomerResponse> deactivate(
            @PathVariable UUID customerId
    ) {
        return ResponseEntity.ok(
                customerService.deactivate(customerId)
        );
    }
}