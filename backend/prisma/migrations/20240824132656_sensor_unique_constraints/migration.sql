/*
  Warnings:

  - A unique constraint covering the columns `[panelId,name]` on the table `Sensor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[address,name]` on the table `Sensor` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Sensor_address_key` ON `Sensor`;

-- DropIndex
DROP INDEX `Sensor_name_key` ON `Sensor`;

-- CreateIndex
CREATE UNIQUE INDEX `Sensor_panelId_name_key` ON `Sensor`(`panelId`, `name`);

-- CreateIndex
CREATE UNIQUE INDEX `Sensor_address_name_key` ON `Sensor`(`address`, `name`);
