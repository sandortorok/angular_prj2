/*
  Warnings:

  - You are about to drop the column `address` on the `Siren` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Siren` DROP COLUMN `address`,
    ADD COLUMN `offAddress` VARCHAR(191) NOT NULL DEFAULT '0000',
    ADD COLUMN `onAddress` VARCHAR(191) NOT NULL DEFAULT '0000';
