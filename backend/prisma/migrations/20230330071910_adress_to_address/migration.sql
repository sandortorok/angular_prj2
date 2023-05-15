/*
  Warnings:

  - You are about to drop the column `adress` on the `Sensor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[address]` on the table `Sensor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `Sensor` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Sensor_adress_key` ON `Sensor`;

-- AlterTable
ALTER TABLE `Sensor` DROP COLUMN `adress`,
    ADD COLUMN `address` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Sensor_address_key` ON `Sensor`(`address`);
