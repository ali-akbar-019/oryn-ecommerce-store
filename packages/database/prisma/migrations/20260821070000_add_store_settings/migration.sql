-- CreateTable
CREATE TABLE `StoreSetting` (
    `id` VARCHAR(191) NOT NULL,
    `storeName` VARCHAR(191) NOT NULL DEFAULT 'ORYN',
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `defaultShippingId` VARCHAR(191) NULL,
    `returnWindowDays` INTEGER NOT NULL DEFAULT 30,
    `sessionHours` INTEGER NOT NULL DEFAULT 8,
    `editorialTheme` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StoreSetting_defaultShippingId_idx`(`defaultShippingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
