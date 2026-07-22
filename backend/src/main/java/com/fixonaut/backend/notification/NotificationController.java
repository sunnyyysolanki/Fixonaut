package com.fixonaut.backend.notification;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>>
    getNotifications(
            @RequestParam(defaultValue = "false")
            boolean unreadOnly,

            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                notificationService.getNotifications(
                        pageable,
                        unreadOnly
                )
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>>
    getUnreadCount() {
        return ResponseEntity.ok(
                Map.of(
                        "count",
                        notificationService.getUnreadCount()
                )
        );
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse>
    markAsRead(
            @PathVariable UUID notificationId
    ) {
        return ResponseEntity.ok(
                notificationService.markAsRead(
                        notificationId
                )
        );
    }

    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Integer>>
    markAllAsRead() {
        return ResponseEntity.ok(
                Map.of(
                        "updated",
                        notificationService.markAllAsRead()
                )
        );
    }
}