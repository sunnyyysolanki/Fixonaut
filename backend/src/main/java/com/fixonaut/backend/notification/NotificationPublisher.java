package com.fixonaut.backend.notification;

import com.fixonaut.backend.security.AuthenticatedUserContext;
import com.fixonaut.backend.user.UserRepository;
import com.fixonaut.backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Central place for deciding WHO receives a notification. Publishes one
 * {@link NotificationRequestedEvent} per recipient; the events are handled
 * after commit to persist the notification and push it over the WebSocket.
 */
@Component
@RequiredArgsConstructor
public class NotificationPublisher {

    private static final Set<UserRole> OFFICE_ROLES = Set.of(
            UserRole.OWNER,
            UserRole.ADMIN,
            UserRole.DISPATCHER
    );

    private final UserRepository userRepository;
    private final AuthenticatedUserContext authenticatedUserContext;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Notify the organization's office staff (owner/admin/dispatcher) plus an
     * optional extra recipient (typically the assigned technician), skipping
     * the user who performed the action so nobody is pinged about their own work.
     */
    public void notifyOffice(
            UUID organizationId,
            UUID extraUserId,
            NotificationType type,
            String title,
            String message,
            String referenceType,
            UUID referenceId
    ) {
        Set<UUID> recipients = new LinkedHashSet<>();

        userRepository
                .findActiveByOrganizationAndRoles(organizationId, OFFICE_ROLES)
                .forEach(user -> recipients.add(user.getId()));

        if (extraUserId != null) {
            recipients.add(extraUserId);
        }

        UUID actorId = currentUserIdOrNull();
        if (actorId != null) {
            recipients.remove(actorId);
        }

        for (UUID userId : recipients) {
            publish(organizationId, userId, type, title, message,
                    referenceType, referenceId);
        }
    }

    /** Notify a single explicit user (no actor exclusion) — used for self-tests. */
    public void notifyUser(
            UUID organizationId,
            UUID userId,
            NotificationType type,
            String title,
            String message,
            String referenceType,
            UUID referenceId
    ) {
        publish(organizationId, userId, type, title, message,
                referenceType, referenceId);
    }

    private void publish(
            UUID organizationId,
            UUID userId,
            NotificationType type,
            String title,
            String message,
            String referenceType,
            UUID referenceId
    ) {
        eventPublisher.publishEvent(
                new NotificationRequestedEvent(
                        organizationId,
                        userId,
                        type,
                        title,
                        message,
                        referenceType,
                        referenceId
                )
        );
    }

    private UUID currentUserIdOrNull() {
        try {
            return authenticatedUserContext.getCurrentUserId();
        } catch (RuntimeException ex) {
            return null;
        }
    }
}
