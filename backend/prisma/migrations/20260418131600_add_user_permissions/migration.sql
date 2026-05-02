-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "card_monitoring" DROP CONSTRAINT "card_monitoring_card_id_fkey";

-- DropForeignKey
ALTER TABLE "card_transfer_items" DROP CONSTRAINT "card_transfer_items_card_id_fkey";

-- DropForeignKey
ALTER TABLE "tpe_maintenance" DROP CONSTRAINT "tpe_maintenance_tpe_id_fkey";

-- DropForeignKey
ALTER TABLE "tpe_reforms" DROP CONSTRAINT "tpe_reforms_tpe_id_fkey";

-- DropForeignKey
ALTER TABLE "tpe_returns" DROP CONSTRAINT "tpe_returns_tpe_id_fkey";

-- DropForeignKey
ALTER TABLE "tpe_transfer_items" DROP CONSTRAINT "tpe_transfer_items_tpe_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "permissions" JSONB DEFAULT '{}';

-- AddForeignKey
ALTER TABLE "tpe_maintenance" ADD CONSTRAINT "tpe_maintenance_tpe_id_fkey" FOREIGN KEY ("tpe_id") REFERENCES "tpe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpe_returns" ADD CONSTRAINT "tpe_returns_tpe_id_fkey" FOREIGN KEY ("tpe_id") REFERENCES "tpe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpe_transfer_items" ADD CONSTRAINT "tpe_transfer_items_tpe_id_fkey" FOREIGN KEY ("tpe_id") REFERENCES "tpe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tpe_reforms" ADD CONSTRAINT "tpe_reforms_tpe_id_fkey" FOREIGN KEY ("tpe_id") REFERENCES "tpe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_monitoring" ADD CONSTRAINT "card_monitoring_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "management_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_transfer_items" ADD CONSTRAINT "card_transfer_items_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "management_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
