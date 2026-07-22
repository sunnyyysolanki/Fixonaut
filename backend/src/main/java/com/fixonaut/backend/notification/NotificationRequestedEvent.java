package com.fixonaut.backend.notification;

import java.util.UUID;

public record NotificationRequestedEvent(
        UUID organizationId,
        UUID userId,
        NotificationType notificationType,
        String title,
        String message,
        String referenceType,
        UUID referenceId
) {
}