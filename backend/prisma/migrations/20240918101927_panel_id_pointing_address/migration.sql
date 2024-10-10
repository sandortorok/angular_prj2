-- DropForeignKey
ALTER TABLE `Sensor` DROP FOREIGN KEY `Sensor_panelId_fkey`;

-- DropForeignKey
ALTER TABLE `Siren` DROP FOREIGN KEY `Siren_panelId_fkey`;

-- AddForeignKey
ALTER TABLE `Sensor` ADD CONSTRAINT `Sensor_panelId_fkey` FOREIGN KEY (`panelId`) REFERENCES `Panel`(`address`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Siren` ADD CONSTRAINT `Siren_panelId_fkey` FOREIGN KEY (`panelId`) REFERENCES `Panel`(`address`) ON DELETE RESTRICT ON UPDATE CASCADE;
