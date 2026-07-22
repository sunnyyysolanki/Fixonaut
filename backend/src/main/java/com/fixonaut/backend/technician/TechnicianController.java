package com.fixonaut.backend.technician;

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
@RequestMapping("/api/v1/technicians")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianService technicianService;

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<TechnicianResponse> create(
            @Valid @RequestBody CreateTechnicianRequest request
    ) {
        TechnicianResponse response =
                technicianService.create(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{technicianId}")
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
    public ResponseEntity<Page<TechnicianResponse>> search(
            @RequestParam(required = false) String search,

            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {
        Page<TechnicianResponse> response =
                technicianService.search(
                        search,
                        pageable
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{technicianId}")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<TechnicianResponse> getById(
            @PathVariable UUID technicianId
    ) {
        return ResponseEntity.ok(
                technicianService.getById(technicianId)
        );
    }

    @PatchMapping("/{technicianId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<TechnicianResponse> update(
            @PathVariable UUID technicianId,
            @Valid @RequestBody UpdateTechnicianRequest request
    ) {
        return ResponseEntity.ok(
                technicianService.update(
                        technicianId,
                        request
                )
        );
    }

    @PatchMapping("/{technicianId}/deactivate")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<TechnicianResponse> deactivate(
            @PathVariable UUID technicianId
    ) {
        return ResponseEntity.ok(
                technicianService.deactivate(technicianId)
        );
    }
}