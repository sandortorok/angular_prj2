/*
  Warnings:

  - You are about to drop the column `number` on the `Sensor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[adress]` on the table `Sensor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `adress` to the `Sensor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Sensor` DROP COLUMN `number`,
    ADD COLUMN `adress` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Sensor_adress_key` ON `Sensor`(`adress`);
