/*
  Warnings:

  - Made the column `(first_name)` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `(last_name)` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "(image_url)" TEXT,
ALTER COLUMN "(first_name)" SET NOT NULL,
ALTER COLUMN "(last_name)" SET NOT NULL;
