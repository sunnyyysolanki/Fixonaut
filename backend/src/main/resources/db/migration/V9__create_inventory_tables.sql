CREATE TABLE parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    sku VARCHAR(80) NOT NULL,

    name VARCHAR(180) NOT NULL,

    unit VARCHAR(30) NOT NULL DEFAULT 'piece',

    quantity_on_hand INTEGER NOT NULL DEFAULT 0,

    reorder_level INTEGER NOT NULL DEFAULT 0,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_parts_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_parts_organization_sku
        UNIQUE (organization_id, sku),

    CONSTRAINT chk_parts_quantity
        CHECK (quantity_on_hand >= 0),

    CONSTRAINT chk_parts_reorder_level
        CHECK (reorder_level >= 0)
);

CREATE INDEX idx_parts_organization
    ON parts(organization_id);

CREATE INDEX idx_parts_active
    ON parts(organization_id, active);

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    part_id UUID NOT NULL,

    service_request_id UUID,

    created_by_user_id UUID NOT NULL,

    transaction_type VARCHAR(30) NOT NULL,

    quantity INTEGER NOT NULL,

    note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_transactions_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_inventory_transactions_part
        FOREIGN KEY (part_id)
        REFERENCES parts(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_inventory_transactions_service_request
        FOREIGN KEY (service_request_id)
        REFERENCES service_requests(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_inventory_transactions_user
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_inventory_transaction_type
        CHECK (
            transaction_type IN (
                'STOCK_IN',
                'STOCK_OUT',
                'ADJUSTMENT'
            )
        ),

    CONSTRAINT chk_inventory_transaction_quantity
        CHECK (quantity > 0)
);

CREATE INDEX idx_inventory_transactions_part
    ON inventory_transactions(part_id, created_at);

CREATE INDEX idx_inventory_transactions_service_request
    ON inventory_transactions(service_request_id);

CREATE TABLE service_request_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    service_request_id UUID NOT NULL,

    part_id UUID NOT NULL,

    quantity INTEGER NOT NULL,

    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,

    added_by_user_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_service_request_parts_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_service_request_parts_request
        FOREIGN KEY (service_request_id)
        REFERENCES service_requests(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_service_request_parts_part
        FOREIGN KEY (part_id)
        REFERENCES parts(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_service_request_parts_user
        FOREIGN KEY (added_by_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_service_request_parts_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_service_request_parts_unit_cost
        CHECK (unit_cost >= 0)
);

CREATE INDEX idx_service_request_parts_request
    ON service_request_parts(service_request_id);

CREATE INDEX idx_service_request_parts_part
    ON service_request_parts(part_id);