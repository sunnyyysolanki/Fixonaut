package com.fixonaut.backend.notification;

import com.fixonaut.backend.common.exception.ResourceNotFoundException;
import com.fixonaut.backend.organization.OrganizationEntity;
import com.fixonaut.backend.security.AuthenticatedUserContext;
import com.fixonaut.backend.user.UserEntity;
import com.fixonaut.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final AuthenticatedUserContext
            authenticatedUserContext;

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(
            Pageable pageable,
            boolean unreadOnly
    ) {
        UUID userId =
                authenticatedUserContext.getCurrentUserId();

        Page<NotificationEntity> notifications =
                unreadOnly
                        ? notificationRepository
                        .findUnreadForUser(userId, pageable)
                        : notificationRepository
                        .findForUser(userId, pageable);

        return notifications.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        UUID userId =
                authenticatedUserContext.getCurrentUserId();

        return notificationRepository
                .countUnreadForUser(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(
            UUID notificationId
    ) {
        UUID userId =
                authenticatedUserContext.getCurrentUserId();

        NotificationEntity notification =
                notificationRepository
                        .findByIdAndUserId(
                                notificationId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found"
                                )
                        );

        notification.markAsRead();

        return toResponse(notification);
    }

    @Transactional
    public int markAllAsRead() {
        UUID userId =
                authenticatedUserContext.getCurrentUserId();

        return notificationRepository
                .markAllAsRead(userId);
    }

    @Transactional
    public NotificationResponse createForUser(
            UserEntity user,
            NotificationType notificationType,
            String title,
            String message,
            String referenceType,
            UUID referenceId
    ) {
        OrganizationEntity organization =
                user.getOrganization();

        NotificationEntity notification =
                new NotificationEntity(
                        organization,
                        user,
                        notificationType,
                        title,
                        message,
                        referenceType,
                        referenceId
                );

        return toResponse(
                notificationRepository.save(notification)
        );
    }

    private NotificationResponse toResponse(
            NotificationEntity notification
    ) {
        return new NotificationResponse(
                notification.getId(),
                notification.getNotificationType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getReferenceType(),
                notification.getReferenceId(),
                notification.isRead(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}