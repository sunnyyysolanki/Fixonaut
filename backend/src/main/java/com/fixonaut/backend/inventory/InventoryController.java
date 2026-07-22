package com.fixonaut.backend.inventory;

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
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/parts")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<PartResponse> createPart(
            @Valid @RequestBody CreatePartRequest request
    ) {
        PartResponse response =
                inventoryService.createPart(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{partId}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(response);
    }

    @GetMapping("/parts")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<Page<PartResponse>> searchParts(
            @RequestParam(required = false) String search,

            @PageableDefault(
                    size = 20,
                    sort = "name",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                inventoryService.searchParts(
                        search,
                        pageable
                )
        );
    }

    @GetMapping("/parts/{partId}")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<PartResponse> getPart(
            @PathVariable UUID partId
    ) {
        return ResponseEntity.ok(
                inventoryService.getPart(partId)
        );
    }

    @PatchMapping("/parts/{partId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<PartResponse> updatePart(
            @PathVariable UUID partId,
            @Valid @RequestBody UpdatePartRequest request
    ) {
        return ResponseEntity.ok(
                inventoryService.updatePart(
                        partId,
                        request
                )
        );
    }

    @PostMapping("/parts/{partId}/stock-in")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<PartResponse> stockIn(
            @PathVariable UUID partId,
            @Valid @RequestBody StockInRequest request
    ) {
        return ResponseEntity.ok(
                inventoryService.stockIn(
                        partId,
                        request
                )
        );
    }

    @GetMapping("/parts/{partId}/transactions")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<List<InventoryTransactionResponse>>
    getPartTransactions(
            @PathVariable UUID partId
    ) {
        return ResponseEntity.ok(
                inventoryService.getPartTransactions(
                        partId
                )
        );
    }

    @PostMapping("/inventory/consume")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<ServiceRequestPartResponse>
    consumePart(
            @Valid @RequestBody ConsumePartRequest request
    ) {
        return ResponseEntity.ok(
                inventoryService.consumePart(request)
        );
    }

    @GetMapping(
            "/service-requests/{serviceRequestId}/parts"
    )
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<List<ServiceRequestPartResponse>>
    getServiceRequestParts(
            @PathVariable UUID serviceRequestId
    ) {
        return ResponseEntity.ok(
                inventoryService.getServiceRequestParts(
                        serviceRequestId
                )
        );
    }
}