-- CreateEnum
CREATE TYPE "StructureType" AS ENUM ('agence', 'antenne', 'cellule');

-- Migrate existing data: rename old string values to new enum values
UPDATE "structures" SET "type" = 'agence'  WHERE "type" = 'agency';
UPDATE "structures" SET "type" = 'antenne' WHERE "type" = 'antenna';

-- AlterTable: change type column from VARCHAR to StructureType enum
ALTER TABLE "structures"
  ALTER COLUMN "type" TYPE "StructureType"
  USING "type"::"StructureType";
