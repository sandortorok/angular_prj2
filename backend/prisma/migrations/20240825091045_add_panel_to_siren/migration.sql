/*
  Warnings:

  - A unique constraint covering the columns `[panelId,name]` on the table `Siren` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[panelId,address]` on the table `Siren` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Siren_name_key` ON `Siren`;

-- AlterTable
ALTER TABLE `Siren` ADD COLUMN `panelId` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX `Siren_panelId_name_key` ON `Siren`(`panelId`, `name`);

-- CreateIndex
CREATE UNIQUE INDEX `Siren_panelId_address_key` ON `Siren`(`panelId`, `address`);

-- AddForeignKey
ALTER TABLE `Siren` ADD CONSTRAINT `Siren_panelId_fkey` FOREIGN KEY (`panelId`) REFERENCES `Panel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
