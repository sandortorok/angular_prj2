/*
  Warnings:

  - You are about to drop the column `offAddress` on the `Siren` table. All the data in the column will be lost.
  - You are about to drop the column `onAddress` on the `Siren` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Siren` DROP COLUMN `offAddress`,
    DROP COLUMN `onAddress`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL DEFAULT '0000',
    ADD COLUMN `on` BOOLEAN NOT NULL DEFAULT false;
