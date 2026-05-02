-- Add enums
CREATE TYPE "NotificationType" AS ENUM (
  'new_pending_user',
  'login_support_request',
  'suspicious_activity',
  'user_request_approved',
  'user_request_rejected'
);

CREATE TYPE "NotificationStatus" AS ENUM ('unread', 'read');

CREATE TYPE "SupportRequestStatus" AS ENUM ('open', 'in_progress', 'resolved', 'rejected');

-- Add requester tracking to users
ALTER TABLE "users"
ADD COLUMN "requested_by_id" INTEGER;

ALTER TABLE "users"
ADD CONSTRAINT "users_requested_by_id_fkey"
FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "users_requested_by_id_idx" ON "users"("requested_by_id");

-- Notifications table
CREATE TABLE "notifications" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" VARCHAR(180) NOT NULL,
  "message" TEXT,
  "payload" JSONB DEFAULT '{}'::jsonb,
  "status" "NotificationStatus" NOT NULL DEFAULT 'unread',
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX "notifications_status_idx" ON "notifications"("status");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at" DESC);

-- Login support requests table
CREATE TABLE "login_support_requests" (
  "id" SERIAL NOT NULL,
  "requester_name" VARCHAR(150) NOT NULL,
  "requester_email" VARCHAR(255) NOT NULL,
  "requester_phone" VARCHAR(20),
  "problem_description" TEXT NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb,
  "status" "SupportRequestStatus" NOT NULL DEFAULT 'open',
  "created_by_user_id" INTEGER,
  "assigned_admin_id" INTEGER,
  "admin_notes" TEXT,
  "resolved_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "login_support_requests_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "login_support_requests"
ADD CONSTRAINT "login_support_requests_created_by_user_id_fkey"
FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "login_support_requests"
ADD CONSTRAINT "login_support_requests_assigned_admin_id_fkey"
FOREIGN KEY ("assigned_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "login_support_requests_status_idx" ON "login_support_requests"("status");
CREATE INDEX "login_support_requests_created_at_idx" ON "login_support_requests"("created_at" DESC);
