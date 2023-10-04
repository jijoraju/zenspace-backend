/*
  Warnings:

  - Added the required column `locationLocation_id` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "locationLocation_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Location" (
    "location_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("location_id")
);

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_locationLocation_id_fkey" FOREIGN KEY ("locationLocation_id") REFERENCES "Location"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Add data to location
-- Insert data into the Location table
INSERT INTO Location (name, province, latitude, longitude)
VALUES
  ('Toronto', 'Ontario', 43.653225, -79.383186),
  ('Ottawa', 'Ontario', 45.421530, -75.690020),
  ('Hamilton', 'Ontario', 43.255720, -79.871102),
  ('London', 'Ontario', 42.984923, -81.245277),
  ('Kitchener', 'Ontario', 43.450100, -80.482815),
  ('Windsor', 'Ontario', 42.314937, -83.036363),
  ('Mississauga', 'Ontario', 43.589046, -79.644120),
  ('Brampton', 'Ontario', 43.683334, -79.766670),
  ('Markham', 'Ontario', 43.856100, -79.337019),
  ('Vaughan', 'Ontario', 43.797371, -79.552264);
