/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Panel` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `Panel` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Panel` MODIFY `name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Panel_name_key` ON `Panel`(`name`);
