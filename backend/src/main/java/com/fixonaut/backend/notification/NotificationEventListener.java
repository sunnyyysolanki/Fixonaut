package com.fixonaut.backend.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;

    private final SimpMessagingTemplate
            messagingTemplate;

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handle(
            NotificationRequestedEvent event
    ) {
        NotificationResponse notification =
                notificationService.createFromEvent(event);

        messagingTemplate.convertAndSendToUser(
                event.userId().toString(),
                "/queue/notifications",
                notification
        );
    }
}