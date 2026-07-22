package com.fixonaut.backend.scheduling;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SchedulingController {

    private final SchedulingService schedulingService;

    @PostMapping("/api/v1/appointments")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DISPATCHER')")
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request
    ) {
        AppointmentResponse response =
                schedulingService.createAppointment(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{appointmentId}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(response);
    }

    @GetMapping("/api/v1/appointments/{appointmentId}")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<AppointmentResponse> getAppointment(
            @PathVariable UUID appointmentId
    ) {
        return ResponseEntity.ok(
                schedulingService.getAppointment(
                        appointmentId
                )
        );
    }

    @PatchMapping("/api/v1/appointments/{appointmentId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DISPATCHER')")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody UpdateAppointmentRequest request
    ) {
        return ResponseEntity.ok(
                schedulingService.updateAppointment(
                        appointmentId,
                        request
                )
        );
    }

    @PostMapping("/api/v1/appointments/{appointmentId}/confirm")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER'
            )
            """)
    public ResponseEntity<AppointmentResponse> confirm(
            @PathVariable UUID appointmentId
    ) {
        return ResponseEntity.ok(
                schedulingService.confirm(appointmentId)
        );
    }

    @PostMapping("/api/v1/appointments/{appointmentId}/start")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<AppointmentResponse> start(
            @PathVariable UUID appointmentId
    ) {
        return ResponseEntity.ok(
                schedulingService.start(appointmentId)
        );
    }

    @PostMapping("/api/v1/appointments/{appointmentId}/complete")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<AppointmentResponse> complete(
            @PathVariable UUID appointmentId
    ) {
        return ResponseEntity.ok(
                schedulingService.complete(appointmentId)
        );
    }

    @PostMapping("/api/v1/appointments/{appointmentId}/cancel")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<AppointmentResponse> cancel(
            @PathVariable UUID appointmentId
    ) {
        return ResponseEntity.ok(
                schedulingService.cancel(appointmentId)
        );
    }

    @PostMapping(
            "/api/v1/technicians/{technicianId}/availability"
    )
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<AvailabilityResponse>
    createAvailability(
            @PathVariable UUID technicianId,
            @Valid @RequestBody CreateAvailabilityRequest request
    ) {
        CreateAvailabilityRequest normalizedRequest =
                new CreateAvailabilityRequest(
                        technicianId,
                        request.dayOfWeek(),
                        request.startTime(),
                        request.endTime()
                );

        AvailabilityResponse response =
                schedulingService.createAvailability(
                        normalizedRequest
                );

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{availabilityId}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(response);
    }

    @GetMapping(
            "/api/v1/technicians/{technicianId}/availability"
    )
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER',
                'TECHNICIAN'
            )
            """)
    public ResponseEntity<List<AvailabilityResponse>>
    getAvailability(
            @PathVariable UUID technicianId
    ) {
        return ResponseEntity.ok(
                schedulingService.getAvailability(
                        technicianId
                )
        );
    }
}