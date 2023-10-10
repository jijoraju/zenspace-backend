/*
  Warnings:

  - Added the required column `no_of_space` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "no_of_space" INTEGER NOT NULL;
