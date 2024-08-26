/*
  Warnings:

  - A unique constraint covering the columns `[panelId,address]` on the table `Sensor` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Sensor_address_name_key` ON `Sensor`;

-- CreateIndex
CREATE UNIQUE INDEX `Sensor_panelId_address_key` ON `Sensor`(`panelId`, `address`);
