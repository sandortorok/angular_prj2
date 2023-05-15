/*
  Warnings:

  - A unique constraint covering the columns `[adress]` on the table `Sensor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Sensor_adress_key` ON `Sensor`(`adress`);
