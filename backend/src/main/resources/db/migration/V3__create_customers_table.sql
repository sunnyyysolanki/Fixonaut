CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    name VARCHAR(120) NOT NULL,

    phone VARCHAR(20) NOT NULL,

    email VARCHAR(255),

    address VARCHAR(300),

    city VARCHAR(100),

    state VARCHAR(100),

    postal_code VARCHAR(20),

    notes TEXT,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_customers_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_customers_organization_id
    ON customers(organization_id);

CREATE INDEX idx_customers_organization_name
    ON customers(organization_id, name);

CREATE INDEX idx_customers_phone
    ON customers(phone);