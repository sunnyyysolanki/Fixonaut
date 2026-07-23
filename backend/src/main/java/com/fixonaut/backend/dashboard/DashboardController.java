package com.fixonaut.backend.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("""
            hasAnyRole(
                'OWNER',
                'ADMIN',
                'DISPATCHER'
            )
            """)
    public ResponseEntity<DashboardSummaryResponse>
    getSummary() {
        return ResponseEntity.ok(
                dashboardService.getSummary()
        );
    }

    @GetMapping("/activity")
    @PreAuthorize("""
        hasAnyRole(
            'OWNER',
            'ADMIN',
            'DISPATCHER'
        )
        """)
    public ResponseEntity<List<DashboardActivityResponse>>
    getRecentActivity() {
        return ResponseEntity.ok(
                dashboardService.getRecentActivity()
        );
    }

    @GetMapping("/status-distribution")
    @PreAuthorize("""
        hasAnyRole(
            'OWNER',
            'ADMIN',
            'DISPATCHER'
        )
        """)
    public ResponseEntity<
            java.util.List<StatusMetricResponse>
            > getStatusDistribution() {
        return ResponseEntity.ok(
                dashboardService.getStatusDistribution()
        );
    }
}