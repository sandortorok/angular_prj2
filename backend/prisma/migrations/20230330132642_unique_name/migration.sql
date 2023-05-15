/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Sensor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Sensor_name_key` ON `Sensor`(`name`);
