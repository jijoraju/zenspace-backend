/*
  Warnings:

  - You are about to drop the column `address` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `price_per_hour` on the `Workspace` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[address_id]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address_id` to the `Workspace` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `workspace_type` on the `Workspace` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('ONE_DAY', 'MULTIPLE_DAYS');

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "address",
DROP COLUMN "price_per_hour",
ADD COLUMN     "address_id" INTEGER NOT NULL,
DROP COLUMN "workspace_type",
ADD COLUMN     "workspace_type" "WorkspaceType" NOT NULL;

-- CreateTable
CREATE TABLE "WorkspaceAddress" (
    "workspace_address_id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WorkspaceAddress_pkey" PRIMARY KEY ("workspace_address_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_address_id_key" ON "Workspace"("address_id");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "WorkspaceAddress"("workspace_address_id") ON DELETE RESTRICT ON UPDATE CASCADE;
