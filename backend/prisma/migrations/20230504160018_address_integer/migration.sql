/*
  Warnings:

  - You are about to alter the column `address` on the `Siren` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Siren` MODIFY `address` INTEGER NOT NULL DEFAULT 0;
