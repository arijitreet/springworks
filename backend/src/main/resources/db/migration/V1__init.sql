-- Tally clone — books + stock core schema (Phase 1)
-- Four accounting tables + two stock tables, with double-entry enforced at the database.

-- ---------------------------------------------------------------------------
-- Accounting: chart of accounts
-- ---------------------------------------------------------------------------
CREATE TABLE groups (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            VARCHAR(120) NOT NULL UNIQUE,
    parent_group_id BIGINT REFERENCES groups (id),
    nature          VARCHAR(12)  NOT NULL
        CHECK (nature IN ('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE'))
);

CREATE TABLE ledgers (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            VARCHAR(120)   NOT NULL UNIQUE,
    group_id        BIGINT         NOT NULL REFERENCES groups (id),
    opening_balance NUMERIC(14, 2) NOT NULL DEFAULT 0
);
CREATE INDEX idx_ledgers_group ON ledgers (group_id);

-- ---------------------------------------------------------------------------
-- Accounting: transactions (double entry)
-- ---------------------------------------------------------------------------
CREATE TABLE vouchers (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    voucher_type   VARCHAR(12) NOT NULL
        CHECK (voucher_type IN ('PAYMENT', 'RECEIPT', 'CONTRA', 'JOURNAL', 'SALES', 'PURCHASE')),
    date           DATE        NOT NULL,
    voucher_number VARCHAR(40) NOT NULL,
    narration      TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (voucher_type, voucher_number)
);

CREATE TABLE voucher_entries (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    voucher_id BIGINT         NOT NULL REFERENCES vouchers (id) ON DELETE CASCADE,
    ledger_id  BIGINT         NOT NULL REFERENCES ledgers (id),
    debit      NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
    credit     NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
    -- a single line is either a debit or a credit, never both
    CHECK (NOT (debit > 0 AND credit > 0))
);
CREATE INDEX idx_entries_voucher ON voucher_entries (voucher_id);
CREATE INDEX idx_entries_ledger ON voucher_entries (ledger_id);

-- The core accounting invariant: every voucher's debits must equal its credits.
-- A DEFERRED constraint trigger checks this at COMMIT, so entries can be inserted
-- one row at a time within a transaction and only the final state is validated.
CREATE OR REPLACE FUNCTION tally_check_voucher_balance() RETURNS trigger AS $$
DECLARE
    v_id   BIGINT := COALESCE(NEW.voucher_id, OLD.voucher_id);
    totals RECORD;
BEGIN
    -- The voucher may have been deleted (cascade); nothing to check then.
    IF NOT EXISTS (SELECT 1 FROM vouchers WHERE id = v_id) THEN
        RETURN NULL;
    END IF;

    SELECT COALESCE(SUM(debit), 0) AS d, COALESCE(SUM(credit), 0) AS c
    INTO totals
    FROM voucher_entries
    WHERE voucher_id = v_id;

    IF totals.d <> totals.c THEN
        RAISE EXCEPTION
            'Voucher % is unbalanced: debit % <> credit %', v_id, totals.d, totals.c
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_voucher_balance
    AFTER INSERT OR UPDATE OR DELETE ON voucher_entries
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
EXECUTE FUNCTION tally_check_voucher_balance();

-- ---------------------------------------------------------------------------
-- Stock (finished goods)
-- ---------------------------------------------------------------------------
CREATE TABLE stock_items (
    id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name    VARCHAR(120) NOT NULL UNIQUE,
    size_ml INTEGER      NOT NULL CHECK (size_ml > 0),
    unit    VARCHAR(20)  NOT NULL DEFAULT 'bottle'
);

CREATE TABLE stock_movements (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    stock_item_id BIGINT         NOT NULL REFERENCES stock_items (id),
    date          DATE           NOT NULL,
    direction     VARCHAR(4)     NOT NULL CHECK (direction IN ('IN', 'OUT')),
    quantity      NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
    voucher_id    BIGINT REFERENCES vouchers (id) ON DELETE SET NULL,
    note          TEXT
);
CREATE INDEX idx_movements_item ON stock_movements (stock_item_id);
CREATE INDEX idx_movements_date ON stock_movements (date);

-- ---------------------------------------------------------------------------
-- Seed: a minimal chart of accounts, a few ledgers, and the three bottle sizes
-- ---------------------------------------------------------------------------
INSERT INTO groups (name, nature) VALUES
    ('Capital Account',     'LIABILITY'),
    ('Current Liabilities', 'LIABILITY'),
    ('Current Assets',      'ASSET'),
    ('Fixed Assets',        'ASSET'),
    ('Sales Accounts',      'INCOME'),
    ('Direct Incomes',      'INCOME'),
    ('Purchase Accounts',   'EXPENSE'),
    ('Direct Expenses',     'EXPENSE'),
    ('Indirect Expenses',   'EXPENSE');

INSERT INTO ledgers (name, group_id, opening_balance) VALUES
    ('Cash',      (SELECT id FROM groups WHERE name = 'Current Assets'),      0),
    ('Bank',      (SELECT id FROM groups WHERE name = 'Current Assets'),      0),
    ('Sales',     (SELECT id FROM groups WHERE name = 'Sales Accounts'),      0),
    ('Purchases', (SELECT id FROM groups WHERE name = 'Purchase Accounts'),   0),
    ('Capital',   (SELECT id FROM groups WHERE name = 'Capital Account'),     0);

INSERT INTO stock_items (name, size_ml, unit) VALUES
    ('1000 ml Water Bottle', 1000, 'bottle'),
    ('500 ml Water Bottle',   500, 'bottle'),
    ('200 ml Water Bottle',   200, 'bottle');
