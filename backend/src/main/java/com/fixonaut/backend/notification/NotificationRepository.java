package com.fixonaut.backend.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface NotificationRepository
        extends JpaRepository<
        NotificationEntity,
        UUID
        > {

    @Query("""
            SELECT notification
            FROM NotificationEntity notification
            WHERE notification.user.id = :userId
            ORDER BY notification.createdAt DESC
            """)
    Page<NotificationEntity> findForUser(
            @Param("userId") UUID userId,
            Pageable pageable
    );

    @Query("""
            SELECT notification
            FROM NotificationEntity notification
            WHERE notification.user.id = :userId
              AND notification.readAt IS NULL
            ORDER BY notification.createdAt DESC
            """)
    Page<NotificationEntity> findUnreadForUser(
            @Param("userId") UUID userId,
            Pageable pageable
    );

    @Query("""
            SELECT COUNT(notification)
            FROM NotificationEntity notification
            WHERE notification.user.id = :userId
              AND notification.readAt IS NULL
            """)
    long countUnreadForUser(
            @Param("userId") UUID userId
    );

    @Query("""
            SELECT notification
            FROM NotificationEntity notification
            WHERE notification.id = :notificationId
              AND notification.user.id = :userId
            """)
    java.util.Optional<NotificationEntity>
    findByIdAndUserId(
            @Param("notificationId") UUID notificationId,
            @Param("userId") UUID userId
    );
}