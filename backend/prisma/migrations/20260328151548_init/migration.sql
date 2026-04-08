-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('administrator', 'dpe_member', 'district_member', 'agency_member', 'antenna_member');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'pending');

-- CreateEnum
CREATE TYPE "TpeModel" AS ENUM ('IWIL 250', 'MOVE 2500', 'NewPos');

-- CreateEnum
CREATE TYPE "Operator" AS ENUM ('Djezzy', 'Mobilis', 'Ooredoo');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('Initial', 'Supplementaire');

-- CreateEnum
CREATE TYPE "TpeStatus" AS ENUM ('en_stock', 'en_service', 'en_maintenance', 'en_panne', 'en_transfert', 'vole', 'en_traitement', 'a_retourner', 'reforme');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('en_panne', 'en_traitement', 'trs_envoye', 'trs_recu', 'envoye_fournisseur', 'repare', 'changement_sim', 'reconfigure', 'retourne', 'remplace', 'irreparable', 'reforme', 'a_retourner');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('en_stock', 'en_circulation', 'en_maintenance', 'en_transfert', 'defectueux', 'expire', 'perdu', 'vole', 'en_traitement');

-- CreateEnum
CREATE TYPE "CardMonitoringStatus" AS ENUM ('en_traitement', 'defectueux', 'expire', 'perdu', 'vole', 'sim_endommage', 'physiquement_endommage', 'debloquee', 'remplace', 'n_a');

-- CreateEnum
CREATE TYPE "ChargerTransferType" AS ENUM ('charger', 'base');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('login', 'logout', 'create', 'update', 'delete', 'view', 'export', 'import', 'transfer', 'settings');

-- CreateEnum
CREATE TYPE "AuditModule" AS ENUM ('auth', 'tpe', 'chargers', 'cards', 'users', 'structures', 'system');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('info', 'warning', 'critical');

-- CreateTable
CREATE TABLE "districts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "wilaya" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "structures" (
    "id" SERIAL NOT NULL,
    "district_id" INTEGER NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "wilaya" VARCHAR(100),
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stations" (
    "id" SERIAL NOT NULL,
    "structure_id" INTEGER NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "address" TEXT,
    "wilaya" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "district_id" INTEGER,
    "structure_id" INTEGER,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "failed_logins" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "family" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(512),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tpe" (
    "id" SERIAL NOT NULL,
    "serial" VARCHAR(50) NOT NULL,
    "model" "TpeModel" NOT NULL,
    "purchase_price" DECIMAL(12,2),
    "operator" "Operator",
    "sim_serial" VARCHAR(50),
    "sim_ip" VARCHAR(45),
    "sim_phone" VARCHAR(20),
    "reception_date" DATE,
    "delivery_date" DATE,
    "expiration_date" DATE,
    "assignment_type" "AssignmentType",
    "station_id" INTEGER,
    "status" "TpeStatus" NOT NULL DEFAULT 'en_stock',
    "inventory_number" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tpe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tpe_maintenance" (
    "id" SERIAL NOT NULL,
    "tpe_id" INTEGER NOT NULL,
    "station_id" INTEGER,
    "operation_mode" VARCHAR(50) NOT NULL,
    "breakdown_date" DATE NOT NULL,
    "diagnostic" TEXT,
    "trs_st_str" DATE,
    "trs_str_dpe" DATE,
    "trs_dpe_dcsi" DATE,
    "trs_dcsi_dpe" DATE,
    "trs_dpe_str" DATE,
    "trs_str_st" DATE,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'en_traitement',
    "processing_duration" INTEGER,
    "immobilization_duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tpe_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tpe_returns" (
    "id" SERIAL NOT NULL,
    "tpe_id" INTEGER NOT NULL,
    "old_station_id" INTEGER,
    "new_station_id" INTEGER,
    "return_reason" VARCHAR(50) NOT NULL,
    "trs_st1_str" DATE,
    "trs_str_dpe" DATE,
    "trs_dpe_dcsi" DATE,
    "trs_dcsi_dpe" DATE,
    "trs_dpe_str" DATE,
    "trs_str_st2" DATE,
    "processing_duration" INTEGER,
    "immobilization_duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tpe_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tpe_transfers" (
    "id" SERIAL NOT NULL,
    "source" VARCHAR(150) NOT NULL,
    "destination" VARCHAR(150) NOT NULL,
    "beneficiary_name" VARCHAR(150),
    "beneficiary_function" VARCHAR(100),
    "exit_date" DATE NOT NULL,
    "nbr_tpe" INTEGER NOT NULL DEFAULT 1,
    "discharge" VARCHAR(50),
    "bts_number" VARCHAR(50),
    "reception_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tpe_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tpe_transfer_items" (
    "id" SERIAL NOT NULL,
    "transfer_id" INTEGER NOT NULL,
    "tpe_id" INTEGER NOT NULL,

    CONSTRAINT "tpe_transfer_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tpe_reforms" (
    "id" SERIAL NOT NULL,
    "tpe_id" INTEGER NOT NULL,
    "reform_pv" VARCHAR(50),
    "reform_date" DATE NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tpe_reforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chargers" (
    "id" SERIAL NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "tpe_model" VARCHAR(50),
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chargers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bases" (
    "id" SERIAL NOT NULL,
    "serial" VARCHAR(50) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charger_transfers" (
    "id" SERIAL NOT NULL,
    "type" "ChargerTransferType" NOT NULL,
    "source" VARCHAR(150) NOT NULL,
    "destination" VARCHAR(150) NOT NULL,
    "beneficiary_name" VARCHAR(150),
    "beneficiary_function" VARCHAR(100),
    "exit_date" DATE NOT NULL,
    "nbr_items" INTEGER NOT NULL DEFAULT 1,
    "discharge" VARCHAR(50),
    "bts_number" VARCHAR(50),
    "reception_date" DATE,
    "base_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charger_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_cards" (
    "id" SERIAL NOT NULL,
    "card_serial" VARCHAR(50) NOT NULL,
    "tpe_id" INTEGER,
    "station_id" INTEGER,
    "reception_date" DATE,
    "delivery_date" DATE,
    "expiration_date" DATE,
    "status" "CardStatus" NOT NULL DEFAULT 'en_stock',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "management_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_monitoring" (
    "id" SERIAL NOT NULL,
    "card_id" INTEGER NOT NULL,
    "station_id" INTEGER,
    "operation_mode" VARCHAR(100),
    "anomaly_date" DATE NOT NULL,
    "diagnostic" TEXT,
    "trs_st_str" DATE,
    "trs_str_dpe" DATE,
    "trs_dpe_dcsi" DATE,
    "trs_dcsi_dpe" DATE,
    "trs_dpe_str" DATE,
    "trs_str_st" DATE,
    "substitution_card_id" INTEGER,
    "status" "CardMonitoringStatus" NOT NULL DEFAULT 'en_traitement',
    "processing_duration" INTEGER,
    "immobilization_duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_monitoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_transfers" (
    "id" SERIAL NOT NULL,
    "source" VARCHAR(150) NOT NULL,
    "destination" VARCHAR(150) NOT NULL,
    "beneficiary_name" VARCHAR(150),
    "beneficiary_function" VARCHAR(100),
    "exit_date" DATE NOT NULL,
    "nbr_cards" INTEGER NOT NULL DEFAULT 1,
    "discharge" VARCHAR(50),
    "bts_number" VARCHAR(50),
    "reception_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_transfer_items" (
    "id" SERIAL NOT NULL,
    "transfer_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,

    CONSTRAINT "card_transfer_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_name" VARCHAR(150) NOT NULL,
    "user_role" VARCHAR(30) NOT NULL,
    "action" "AuditAction" NOT NULL,
    "module" "AuditModule" NOT NULL,
    "target" VARCHAR(255),
    "details" TEXT,
    "ip_address" VARCHAR(45),
    "severity" "AuditSeverity" NOT NULL DEFAULT 'info',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "districts_name_key" ON "districts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "districts_code_key" ON "districts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "structures_code_key" ON "structures"("code");

-- CreateIndex
CREATE INDEX "structures_district_id_idx" ON "structures"("district_id");

-- CreateIndex
CREATE UNIQUE INDEX "stations_code_key" ON "stations"("code");

-- CreateIndex
CREATE INDEX "stations_structure_id_idx" ON "stations"("structure_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_district_id_idx" ON "users"("district_id");

-- CreateIndex
CREATE INDEX "users_structure_id_idx" ON "users"("structure_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_family_idx" ON "refresh_tokens"("family");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "tpe_serial_key" ON "tpe"("serial");

-- CreateIndex
CREATE INDEX "tpe_serial_idx" ON "tpe"("serial");

-- CreateIndex
CREATE INDEX "tpe_status_idx" ON "tpe"("status");

-- CreateIndex
CREATE INDEX "tpe_model_idx" ON "tpe"("model");

-- CreateIndex
CREATE INDEX "tpe_station_id_idx" ON "tpe"("station_id");

-- CreateIndex
CREATE INDEX "tpe_maintenance_tpe_id_idx" ON "tpe_maintenance"("tpe_id");

-- CreateIndex
CREATE INDEX "tpe_maintenance_status_idx" ON "tpe_maintenance"("status");

-- CreateIndex
CREATE INDEX "tpe_maintenance_breakdown_date_idx" ON "tpe_maintenance"("breakdown_date");

-- CreateIndex
CREATE INDEX "tpe_returns_tpe_id_idx" ON "tpe_returns"("tpe_id");

-- CreateIndex
CREATE INDEX "tpe_transfers_exit_date_idx" ON "tpe_transfers"("exit_date");

-- CreateIndex
CREATE INDEX "tpe_reforms_tpe_id_idx" ON "tpe_reforms"("tpe_id");

-- CreateIndex
CREATE UNIQUE INDEX "bases_serial_key" ON "bases"("serial");

-- CreateIndex
CREATE INDEX "charger_transfers_exit_date_idx" ON "charger_transfers"("exit_date");

-- CreateIndex
CREATE UNIQUE INDEX "management_cards_card_serial_key" ON "management_cards"("card_serial");

-- CreateIndex
CREATE INDEX "management_cards_card_serial_idx" ON "management_cards"("card_serial");

-- CreateIndex
CREATE INDEX "management_cards_status_idx" ON "management_cards"("status");

-- CreateIndex
CREATE INDEX "management_cards_station_id_idx" ON "management_cards"("station_id");

-- CreateIndex
CREATE INDEX "card_monitoring_card_id_idx" ON "card_monitoring"("card_id");

-- CreateIndex
CREATE INDEX "card_monitoring_status_idx" ON "card_monitoring"("status");

-- CreateIndex
CREATE INDEX "card_transfers_exit_date_idx" ON "card_transfers"("exit_date");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_module_idx" ON "audit_logs"("module");

-- CreateIndex
CREATE INDEX "audit_logs_severity_idx" ON "audit_logs"("severity");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "structures" ADD CONSTRAINT "structures_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stations" ADD CONSTRAINT "stations_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpe" ADD CONSTRAINT "tpe_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpe_maintenance" ADD CONSTRAINT "tpe_maintenance_tpe_id_fkey" FOREIGN KEY ("tpe_id") REFERENCES "tpe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpe_maintenance" ADD CONSTRAINT "tpe_maintenance_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpe_returns" ADD CONSTRAINT "tpe_returns_tpe_id_fkey" FOREIGN KEY ("tpe_id") REFERENCES "tpe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpe_returns" ADD CONSTRAINT "tpe_returns_old_station_id_fkey" FOREIGN KEY ("old_station_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpe_returns" ADD CONSTRAINT "tpe_returns_new_station_id_fkey" FOREIGN KEY ("new_station_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpe_transfer_items" ADD CONSTRAINT "tpe_transfer_items_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "tpe_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpe_transfer_items" ADD CONSTRAINT "tpe_transfer_items_tpe_id_fkey" FOREIGN KEY ("tpe_id") REFERENCES "tpe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpe_reforms" ADD CONSTRAINT "tpe_reforms_tpe_id_fkey" FOREIGN KEY ("tpe_id") REFERENCES "tpe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charger_transfers" ADD CONSTRAINT "charger_transfers_base_id_fkey" FOREIGN KEY ("base_id") REFERENCES "bases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_cards" ADD CONSTRAINT "management_cards_tpe_id_fkey" FOREIGN KEY ("tpe_id") REFERENCES "tpe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_cards" ADD CONSTRAINT "management_cards_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_monitoring" ADD CONSTRAINT "card_monitoring_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "management_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_monitoring" ADD CONSTRAINT "card_monitoring_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_monitoring" ADD CONSTRAINT "card_monitoring_substitution_card_id_fkey" FOREIGN KEY ("substitution_card_id") REFERENCES "management_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_transfer_items" ADD CONSTRAINT "card_transfer_items_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "card_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_transfer_items" ADD CONSTRAINT "card_transfer_items_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "management_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
