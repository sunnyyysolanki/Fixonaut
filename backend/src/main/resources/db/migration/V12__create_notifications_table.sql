CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    user_id UUID NOT NULL,

    notification_type VARCHAR(50) NOT NULL,

    title VARCHAR(180) NOT NULL,

    message TEXT NOT NULL,

    reference_type VARCHAR(50),

    reference_id UUID,

    read_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_created
    ON notifications(user_id, created_at DESC);

CREATE INDEX idx_notifications_user_unread
    ON notifications(user_id, read_at);

CREATE INDEX idx_notifications_reference
    ON notifications(reference_type, reference_id);