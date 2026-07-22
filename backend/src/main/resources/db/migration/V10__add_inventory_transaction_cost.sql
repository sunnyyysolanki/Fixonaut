ALTER TABLE inventory_transactions
    ADD COLUMN unit_cost NUMERIC(12, 2)
        NOT NULL DEFAULT 0;

ALTER TABLE inventory_transactions
    ADD CONSTRAINT chk_inventory_transaction_unit_cost
        CHECK (unit_cost >= 0);