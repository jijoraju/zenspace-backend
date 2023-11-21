/*
  Warnings:

  - You are about to drop the column `payment_id` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `total_price` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `grandTotal` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeSessionId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAmount` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_payment_id_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "payment_id",
DROP COLUMN "total_price",
ADD COLUMN     "grandTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "stripeSessionId" TEXT NOT NULL,
ADD COLUMN     "taxAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "Payment";

-- DropEnum
DROP TYPE "PaymentMethod";
