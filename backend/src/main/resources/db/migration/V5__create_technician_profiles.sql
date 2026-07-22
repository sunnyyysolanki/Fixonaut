CREATE TABLE technician_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    user_id UUID NOT NULL UNIQUE,

    phone VARCHAR(20) NOT NULL,

    skills TEXT,

    service_area VARCHAR(200),

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_technician_profiles_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_technician_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_technician_profiles_organization
    ON technician_profiles(organization_id);

CREATE INDEX idx_technician_profiles_active
    ON technician_profiles(organization_id, active);

CREATE INDEX idx_technician_profiles_service_area
    ON technician_profiles(organization_id, service_area);