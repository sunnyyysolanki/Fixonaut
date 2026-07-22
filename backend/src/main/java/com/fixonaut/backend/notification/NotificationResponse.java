package com.fixonaut.backend.notification;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        NotificationType notificationType,
        String title,
        String message,
        String referenceType,
        UUID referenceId,
        boolean read,
        Instant readAt,
        Instant createdAt
) {
}