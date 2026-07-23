package com.fixonaut.backend.service;

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
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/service-requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DISPATCHER')")
    public ResponseEntity<ServiceRequestResponse> create(
            @Valid @RequestBody CreateServiceRequestRequest request
    ) {
        ServiceRequestResponse response =
                serviceRequestService.create(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{requestId}")
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
    public ResponseEntity<Page<ServiceRequestResponse>> search(
            @RequestParam(required = false)
            UUID customerId,

            @RequestParam(required = false)
            ServiceRequestStatus status,

            @RequestParam(required = false)
            ServiceRequestPriority priority,

            @RequestParam(required = false)
            String search,

            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {
        Page<ServiceRequestResponse> response =
                serviceRequestService.search(
                        customerId,
                        status,
                        priority,
                        search,
                        pageable
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{requestId}")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<ServiceRequestResponse> getById(
            @PathVariable UUID requestId
    ) {
        return ResponseEntity.ok(
                serviceRequestService.getById(requestId)
        );
    }

    @PostMapping("/{requestId}/assign")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DISPATCHER')")
    public ResponseEntity<ServiceRequestResponse> assignTechnician(
            @PathVariable UUID requestId,
            @Valid @RequestBody AssignTechnicianRequest request
    ) {
        return ResponseEntity.ok(
                serviceRequestService.assignTechnician(
                        requestId,
                        request.technicianId()
                )
        );
    }

    @PostMapping("/{requestId}/accept")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ServiceRequestResponse> accept(
            @PathVariable UUID requestId,
            @RequestBody(required = false)
            ChangeStatusRequest request
    ) {
        return ResponseEntity.ok(
                serviceRequestService.accept(
                        requestId,
                        getNote(request)
                )
        );
    }

    @PostMapping("/{requestId}/start")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ServiceRequestResponse> start(
            @PathVariable UUID requestId,
            @RequestBody(required = false)
            ChangeStatusRequest request
    ) {
        return ResponseEntity.ok(
                serviceRequestService.start(
                        requestId,
                        getNote(request)
                )
        );
    }

    @PostMapping("/{requestId}/waiting-for-part")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ServiceRequestResponse> waitForPart(
            @PathVariable UUID requestId,
            @RequestBody(required = false)
            ChangeStatusRequest request
    ) {
        return ResponseEntity.ok(
                serviceRequestService.waitForPart(
                        requestId,
                        getNote(request)
                )
        );
    }

    @PostMapping("/{requestId}/complete")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ServiceRequestResponse> complete(
            @PathVariable UUID requestId,
            @RequestBody(required = false)
            ChangeStatusRequest request
    ) {
        return ResponseEntity.ok(
                serviceRequestService.complete(
                        requestId,
                        getNote(request)
                )
        );
    }

    @PostMapping("/{requestId}/cancel")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<ServiceRequestResponse> cancel(
            @PathVariable UUID requestId,
            @RequestBody(required = false)
            ChangeStatusRequest request
    ) {
        return ResponseEntity.ok(
                serviceRequestService.cancel(
                        requestId,
                        getNote(request)
                )
        );
    }

    private String getNote(ChangeStatusRequest request) {
        return request == null ? null : request.note();
    }

    @GetMapping("/{requestId}/history")
    @PreAuthorize("""
        hasAnyRole(
            'OWNER',
            'ADMIN',
            'DISPATCHER',
            'TECHNICIAN'
        )
        """)
    public ResponseEntity<
            List<ServiceRequestStatusHistoryResponse>
            > getHistory(
            @PathVariable UUID requestId
    ) {
        return ResponseEntity.ok(
                serviceRequestService.getHistory(requestId)
        );
    }
}