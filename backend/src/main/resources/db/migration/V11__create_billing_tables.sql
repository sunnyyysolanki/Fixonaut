CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    service_request_id UUID NOT NULL,

    created_by_user_id UUID NOT NULL,

    quote_number VARCHAR(50) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    currency VARCHAR(3) NOT NULL DEFAULT 'INR',

    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,

    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

    valid_until DATE,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_quotes_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_quotes_service_request
        FOREIGN KEY (service_request_id)
        REFERENCES service_requests(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_quotes_created_by_user
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_quotes_organization_number
        UNIQUE (organization_id, quote_number),

    CONSTRAINT chk_quotes_status
        CHECK (
            status IN (
                'DRAFT',
                'SENT',
                'APPROVED',
                'REJECTED',
                'EXPIRED'
            )
        ),

    CONSTRAINT chk_quotes_amounts
        CHECK (
            subtotal >= 0
            AND discount_amount >= 0
            AND tax_amount >= 0
            AND total_amount >= 0
        )
);

CREATE INDEX idx_quotes_organization
    ON quotes(organization_id);

CREATE INDEX idx_quotes_service_request
    ON quotes(service_request_id);

CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quote_id UUID NOT NULL,

    item_type VARCHAR(20) NOT NULL,

    description VARCHAR(300) NOT NULL,

    quantity NUMERIC(12, 2) NOT NULL,

    unit_price NUMERIC(12, 2) NOT NULL,

    line_total NUMERIC(12, 2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_quote_items_quote
        FOREIGN KEY (quote_id)
        REFERENCES quotes(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_quote_items_type
        CHECK (
            item_type IN (
                'LABOR',
                'PART',
                'OTHER'
            )
        ),

    CONSTRAINT chk_quote_items_amounts
        CHECK (
            quantity > 0
            AND unit_price >= 0
            AND line_total >= 0
        )
);

CREATE INDEX idx_quote_items_quote
    ON quote_items(quote_id);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    service_request_id UUID NOT NULL UNIQUE,

    quote_id UUID,

    created_by_user_id UUID NOT NULL,

    invoice_number VARCHAR(50) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',

    currency VARCHAR(3) NOT NULL DEFAULT 'INR',

    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,

    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,

    issued_at TIMESTAMPTZ,

    paid_at TIMESTAMPTZ,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoices_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_invoices_service_request
        FOREIGN KEY (service_request_id)
        REFERENCES service_requests(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_invoices_quote
        FOREIGN KEY (quote_id)
        REFERENCES quotes(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_invoices_created_by_user
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_invoices_organization_number
        UNIQUE (organization_id, invoice_number),

    CONSTRAINT chk_invoices_status
        CHECK (
            status IN (
                'DRAFT',
                'ISSUED',
                'CANCELLED'
            )
        ),

    CONSTRAINT chk_invoices_payment_status
        CHECK (
            payment_status IN (
                'UNPAID',
                'PARTIALLY_PAID',
                'PAID'
            )
        ),

    CONSTRAINT chk_invoices_amounts
        CHECK (
            subtotal >= 0
            AND discount_amount >= 0
            AND tax_amount >= 0
            AND total_amount >= 0
            AND amount_paid >= 0
            AND amount_paid <= total_amount
        )
);

CREATE INDEX idx_invoices_organization
    ON invoices(organization_id);

CREATE INDEX idx_invoices_service_request
    ON invoices(service_request_id);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    invoice_id UUID NOT NULL,

    item_type VARCHAR(20) NOT NULL,

    description VARCHAR(300) NOT NULL,

    quantity NUMERIC(12, 2) NOT NULL,

    unit_price NUMERIC(12, 2) NOT NULL,

    line_total NUMERIC(12, 2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoice_items_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_invoice_items_type
        CHECK (
            item_type IN (
                'LABOR',
                'PART',
                'OTHER'
            )
        ),

    CONSTRAINT chk_invoice_items_amounts
        CHECK (
            quantity > 0
            AND unit_price >= 0
            AND line_total >= 0
        )
);

CREATE INDEX idx_invoice_items_invoice
    ON invoice_items(invoice_id);