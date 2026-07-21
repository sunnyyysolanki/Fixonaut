CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    customer_id UUID NOT NULL,

    assigned_technician_id UUID,

    title VARCHAR(180) NOT NULL,

    description TEXT NOT NULL,

    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',

    status VARCHAR(30) NOT NULL DEFAULT 'NEW',

    scheduled_at TIMESTAMPTZ,

    version BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_service_requests_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_service_requests_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_service_requests_technician
        FOREIGN KEY (assigned_technician_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_service_requests_priority
        CHECK (
            priority IN (
                'LOW',
                'NORMAL',
                'HIGH',
                'URGENT'
            )
        ),

    CONSTRAINT chk_service_requests_status
        CHECK (
            status IN (
                'NEW',
                'ASSIGNED',
                'ACCEPTED',
                'IN_PROGRESS',
                'WAITING_FOR_PART',
                'COMPLETED',
                'CANCELLED'
            )
        )
);

CREATE INDEX idx_service_requests_organization
    ON service_requests(organization_id);

CREATE INDEX idx_service_requests_customer
    ON service_requests(customer_id);

CREATE INDEX idx_service_requests_technician
    ON service_requests(assigned_technician_id);

CREATE INDEX idx_service_requests_status
    ON service_requests(organization_id, status);

CREATE INDEX idx_service_requests_scheduled_at
    ON service_requests(organization_id, scheduled_at);



CREATE TABLE service_request_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    service_request_id UUID NOT NULL,

    changed_by_user_id UUID NOT NULL,

    from_status VARCHAR(30),

    to_status VARCHAR(30) NOT NULL,

    note TEXT,

    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_status_history_service_request
        FOREIGN KEY (service_request_id)
        REFERENCES service_requests(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_status_history_user
        FOREIGN KEY (changed_by_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_status_history_service_request
    ON service_request_status_history(service_request_id);

CREATE INDEX idx_status_history_changed_at
    ON service_request_status_history(changed_at);