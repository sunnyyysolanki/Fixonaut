CREATE TABLE technician_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    technician_user_id UUID NOT NULL,

    day_of_week SMALLINT NOT NULL,

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_technician_availability_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_technician_availability_user
        FOREIGN KEY (technician_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_technician_availability_day
        CHECK (day_of_week BETWEEN 1 AND 7),

    CONSTRAINT chk_technician_availability_time
        CHECK (start_time < end_time)
);

CREATE INDEX idx_technician_availability_technician
    ON technician_availability(
        organization_id,
        technician_user_id,
        day_of_week
    );

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    service_request_id UUID NOT NULL UNIQUE,

    technician_user_id UUID NOT NULL,

    starts_at TIMESTAMPTZ NOT NULL,

    ends_at TIMESTAMPTZ NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_appointments_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_appointments_service_request
        FOREIGN KEY (service_request_id)
        REFERENCES service_requests(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_appointments_technician
        FOREIGN KEY (technician_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_appointments_time
        CHECK (starts_at < ends_at),

    CONSTRAINT chk_appointments_status
        CHECK (
            status IN (
                'SCHEDULED',
                'CONFIRMED',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED',
                'NO_SHOW'
            )
        )
);

CREATE INDEX idx_appointments_organization
    ON appointments(organization_id);

CREATE INDEX idx_appointments_technician_time
    ON appointments(
        organization_id,
        technician_user_id,
        starts_at,
        ends_at
    );

CREATE INDEX idx_appointments_status
    ON appointments(organization_id, status);