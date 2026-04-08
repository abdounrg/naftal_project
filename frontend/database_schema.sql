-- ============================================
-- NAFTAL GAP - Database Schema
-- Gestion Administrative du Parc (TPE, Chargeurs, Bases, Cartes Gestion)
-- ============================================

-- ============================================
-- 1. ORGANIZATIONAL STRUCTURE
-- ============================================

CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    wilaya VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE structures (
    id SERIAL PRIMARY KEY,
    district_id INTEGER NOT NULL REFERENCES districts(id),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('agency', 'antenna')),
    wilaya VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    structure_id INTEGER NOT NULL REFERENCES structures(id),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    address TEXT,
    wilaya VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. USER MANAGEMENT
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('administrator', 'dpe_member', 'district_member', 'agency_member', 'antenna_member')),
    district_id INTEGER REFERENCES districts(id),
    structure_id INTEGER REFERENCES structures(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. TPE MODULE
-- ============================================

-- TPE Stock
CREATE TABLE tpe (
    id SERIAL PRIMARY KEY,
    serial VARCHAR(50) NOT NULL UNIQUE,
    model VARCHAR(50) NOT NULL CHECK (model IN ('IWIL 250', 'MOVE 2500', 'NewPos')),
    purchase_price DECIMAL(12,2),
    operator VARCHAR(20) CHECK (operator IN ('Djezzy', 'Mobilis', 'Ooredoo')),
    sim_serial VARCHAR(50),
    sim_ip VARCHAR(45),
    sim_phone VARCHAR(20),
    reception_date DATE,
    delivery_date DATE,
    expiration_date DATE,
    assignment_type VARCHAR(20) CHECK (assignment_type IN ('Initial', 'Supplementaire')),
    station_id INTEGER REFERENCES stations(id),
    status VARCHAR(30) DEFAULT 'en_stock' CHECK (status IN (
        'en_stock', 'en_service', 'en_maintenance', 'en_panne',
        'vole', 'en_traitement', 'a_retourner', 'reforme'
    )),
    inventory_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TPE Maintenance Records
CREATE TABLE tpe_maintenance (
    id SERIAL PRIMARY KEY,
    tpe_id INTEGER NOT NULL REFERENCES tpe(id),
    station_id INTEGER REFERENCES stations(id),
    operation_mode VARCHAR(50) NOT NULL,
    breakdown_date DATE NOT NULL,
    diagnostic TEXT,
    trs_st_str DATE,
    trs_str_dpe DATE,
    trs_dpe_dcsi DATE,
    trs_dcsi_dpe DATE,
    trs_dpe_str DATE,
    trs_str_st DATE,
    status VARCHAR(30) DEFAULT 'en_traitement' CHECK (status IN (
        'en_traitement', 'repare', 'changement_sim', 'reconfigure',
        'retourne', 'remplace', 'irreparable', 'a_retourner'
    )),
    processing_duration INTEGER, -- in days
    immobilization_duration INTEGER, -- in days
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TPE Returns
CREATE TABLE tpe_returns (
    id SERIAL PRIMARY KEY,
    tpe_id INTEGER NOT NULL REFERENCES tpe(id),
    old_station_id INTEGER REFERENCES stations(id),
    new_station_id INTEGER REFERENCES stations(id),
    return_reason VARCHAR(50) NOT NULL,
    trs_st1_str DATE,
    trs_str_dpe DATE,
    trs_dpe_dcsi DATE,
    trs_dcsi_dpe DATE,
    trs_dpe_str DATE,
    trs_str_st2 DATE,
    processing_duration INTEGER,
    immobilization_duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TPE Transfers
CREATE TABLE tpe_transfers (
    id SERIAL PRIMARY KEY,
    source VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    beneficiary_name VARCHAR(150),
    beneficiary_function VARCHAR(100),
    exit_date DATE NOT NULL,
    nbr_tpe INTEGER NOT NULL DEFAULT 1,
    discharge VARCHAR(50),
    bts_number VARCHAR(50),
    reception_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tpe_transfer_items (
    id SERIAL PRIMARY KEY,
    transfer_id INTEGER NOT NULL REFERENCES tpe_transfers(id),
    tpe_id INTEGER NOT NULL REFERENCES tpe(id)
);

-- TPE Reform
CREATE TABLE tpe_reforms (
    id SERIAL PRIMARY KEY,
    tpe_id INTEGER NOT NULL REFERENCES tpe(id),
    reform_pv VARCHAR(50),
    reform_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. CHARGER / BASE MODULE
-- ============================================

CREATE TABLE chargers (
    id SERIAL PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    tpe_model VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bases (
    id SERIAL PRIMARY KEY,
    serial VARCHAR(50) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE charger_transfers (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('charger', 'base')),
    source VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    beneficiary_name VARCHAR(150),
    beneficiary_function VARCHAR(100),
    exit_date DATE NOT NULL,
    nbr_items INTEGER NOT NULL DEFAULT 1,
    discharge VARCHAR(50),
    bts_number VARCHAR(50),
    reception_date DATE,
    -- For base transfers
    base_id INTEGER REFERENCES bases(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. MANAGEMENT CARDS MODULE
-- ============================================

CREATE TABLE management_cards (
    id SERIAL PRIMARY KEY,
    card_serial VARCHAR(50) NOT NULL UNIQUE,
    tpe_id INTEGER REFERENCES tpe(id),
    station_id INTEGER REFERENCES stations(id),
    reception_date DATE,
    delivery_date DATE,
    expiration_date DATE,
    status VARCHAR(30) DEFAULT 'en_stock' CHECK (status IN (
        'en_stock', 'en_circulation', 'defectueux', 'expire',
        'perdu', 'vole', 'en_traitement'
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE card_monitoring (
    id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL REFERENCES management_cards(id),
    station_id INTEGER REFERENCES stations(id),
    operation_mode VARCHAR(100),
    anomaly_date DATE NOT NULL,
    diagnostic TEXT,
    trs_st_str DATE,
    trs_str_dpe DATE,
    trs_dpe_dcsi DATE,
    trs_dcsi_dpe DATE,
    trs_dpe_str DATE,
    trs_str_st DATE,
    substitution_card_id INTEGER REFERENCES management_cards(id),
    status VARCHAR(30) DEFAULT 'en_traitement' CHECK (status IN (
        'en_traitement', 'defectueux', 'expire', 'perdu', 'vole',
        'sim_endommage', 'physiquement_endommage', 'debloquee', 'remplace', 'n_a'
    )),
    processing_duration INTEGER,
    immobilization_duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE card_transfers (
    id SERIAL PRIMARY KEY,
    source VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    beneficiary_name VARCHAR(150),
    beneficiary_function VARCHAR(100),
    exit_date DATE NOT NULL,
    nbr_cards INTEGER NOT NULL DEFAULT 1,
    discharge VARCHAR(50),
    bts_number VARCHAR(50),
    reception_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    user_name VARCHAR(150) NOT NULL,
    user_role VARCHAR(30) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN (
        'login', 'logout', 'create', 'update', 'delete',
        'view', 'export', 'import', 'transfer', 'settings'
    )),
    module VARCHAR(20) NOT NULL CHECK (module IN (
        'auth', 'tpe', 'chargers', 'cards', 'users', 'structures', 'system'
    )),
    target VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(45),
    severity VARCHAR(10) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_module ON audit_logs(module);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE TABLE card_transfer_items (
    id SERIAL PRIMARY KEY,
    transfer_id INTEGER NOT NULL REFERENCES card_transfers(id),
    card_id INTEGER NOT NULL REFERENCES management_cards(id)
);

-- ============================================
-- 6. INDEXES
-- ============================================

CREATE INDEX idx_tpe_serial ON tpe(serial);
CREATE INDEX idx_tpe_status ON tpe(status);
CREATE INDEX idx_tpe_station ON tpe(station_id);
CREATE INDEX idx_tpe_model ON tpe(model);
CREATE INDEX idx_management_cards_serial ON management_cards(card_serial);
CREATE INDEX idx_management_cards_status ON management_cards(status);
CREATE INDEX idx_management_cards_tpe ON management_cards(tpe_id);
CREATE INDEX idx_structures_district ON structures(district_id);
CREATE INDEX idx_stations_structure ON stations(structure_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_district ON users(district_id);
CREATE INDEX idx_tpe_maintenance_tpe ON tpe_maintenance(tpe_id);
CREATE INDEX idx_tpe_maintenance_status ON tpe_maintenance(status);
CREATE INDEX idx_card_monitoring_card ON card_monitoring(card_id);
CREATE INDEX idx_card_monitoring_status ON card_monitoring(status);
