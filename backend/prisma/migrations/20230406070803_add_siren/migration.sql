-- CreateTable
CREATE TABLE `Siren` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` INTEGER NOT NULL,
    `muted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Siren_name_key`(`name`),
    UNIQUE INDEX `Siren_address_key`(`address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
