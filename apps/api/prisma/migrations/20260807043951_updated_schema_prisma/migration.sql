/*
  Warnings:

  - You are about to drop the `bookings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `instructor_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `instructor_skills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `portfolio_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `skills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `slots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `video_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wallet_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wallets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_slotId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_userId_fkey";

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "instructor_profiles" DROP CONSTRAINT "instructor_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "instructor_skills" DROP CONSTRAINT "instructor_skills_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "instructor_skills" DROP CONSTRAINT "instructor_skills_skillId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "portfolio_items" DROP CONSTRAINT "portfolio_items_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_userId_fkey";

-- DropForeignKey
ALTER TABLE "slots" DROP CONSTRAINT "slots_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "video_sessions" DROP CONSTRAINT "video_sessions_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_walletId_fkey";

-- DropForeignKey
ALTER TABLE "wallets" DROP CONSTRAINT "wallets_userId_fkey";

-- DropTable
DROP TABLE "bookings";

-- DropTable
DROP TABLE "chat_messages";

-- DropTable
DROP TABLE "instructor_profiles";

-- DropTable
DROP TABLE "instructor_skills";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "portfolio_items";

-- DropTable
DROP TABLE "reviews";

-- DropTable
DROP TABLE "skills";

-- DropTable
DROP TABLE "slots";

-- DropTable
DROP TABLE "video_sessions";

-- DropTable
DROP TABLE "wallet_transactions";

-- DropTable
DROP TABLE "wallets";

-- DropEnum
DROP TYPE "BookingStatus";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "PaymentProvider";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "PortfolioMediaType";

-- DropEnum
DROP TYPE "SlotStatus";

-- DropEnum
DROP TYPE "TransactionType";

-- DropEnum
DROP TYPE "VideoSessionStatus";
