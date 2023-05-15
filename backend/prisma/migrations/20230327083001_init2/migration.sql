/*
  Warnings:

  - Made the column `name` on table `Sensor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Sensor` MODIFY `name` VARCHAR(191) NOT NULL;
