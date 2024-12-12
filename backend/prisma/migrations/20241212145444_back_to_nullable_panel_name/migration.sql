-- DropIndex
DROP INDEX `Panel_name_key` ON `Panel`;

-- AlterTable
ALTER TABLE `Panel` MODIFY `name` VARCHAR(191) NULL;
