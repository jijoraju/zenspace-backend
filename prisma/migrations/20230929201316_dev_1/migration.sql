-- CreateTable
CREATE TABLE `UserType` (
    `type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `type_description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NULL,
    `profile_picture` VARCHAR(191) NULL,
    `join_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_type_id` INTEGER NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_mobile_key`(`mobile`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Workspace` (
    `workspace_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `workspace_type` VARCHAR(191) NOT NULL,
    `price_per_hour` DOUBLE NOT NULL,
    `price_per_day` DOUBLE NOT NULL,
    `no_of_spaces` INTEGER NOT NULL,

    PRIMARY KEY (`workspace_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkspacePhoto` (
    `photo_id` INTEGER NOT NULL AUTO_INCREMENT,
    `photo_url` VARCHAR(191) NOT NULL,
    `workspace_id` INTEGER NOT NULL,

    PRIMARY KEY (`photo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `review_id` INTEGER NOT NULL AUTO_INCREMENT,
    `rating` INTEGER NOT NULL,
    `comments` VARCHAR(191) NULL,
    `review_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `workspace_id` INTEGER NOT NULL,

    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DOUBLE NULL,
    `payment_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `payment_method` ENUM('credit_card', 'PayPal') NULL,
    `card_id` INTEGER NOT NULL,

    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `booking_id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `booking_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total_price` VARCHAR(191) NOT NULL,
    `workspace_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `payment_id` INTEGER NOT NULL,

    PRIMARY KEY (`booking_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Amenity` (
    `amenity_id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`amenity_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `notification_id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(191) NOT NULL,
    `notification_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('read', 'unread') NOT NULL,
    `booking_id` INTEGER NOT NULL,

    PRIMARY KEY (`notification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Promotion` (
    `promotion_id` INTEGER NOT NULL AUTO_INCREMENT,
    `promo_code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `discount_percentage` INTEGER NULL,
    `discount_amount` INTEGER NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,

    UNIQUE INDEX `Promotion_promo_code_key`(`promo_code`),
    PRIMARY KEY (`promotion_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkspaceAmenities` (
    `workspace_id` INTEGER NOT NULL,
    `amenity_id` INTEGER NOT NULL,

    PRIMARY KEY (`workspace_id`, `amenity_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPromotion` (
    `user_promotion_id` INTEGER NOT NULL AUTO_INCREMENT,
    `used_date` DATETIME(3) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `promotion_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_promotion_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_user_type_id_fkey` FOREIGN KEY (`user_type_id`) REFERENCES `UserType`(`type_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspacePhoto` ADD CONSTRAINT `WorkspacePhoto_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `Payment`(`payment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`booking_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspaceAmenities` ADD CONSTRAINT `WorkspaceAmenities_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspaceAmenities` ADD CONSTRAINT `WorkspaceAmenities_amenity_id_fkey` FOREIGN KEY (`amenity_id`) REFERENCES `Amenity`(`amenity_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPromotion` ADD CONSTRAINT `UserPromotion_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPromotion` ADD CONSTRAINT `UserPromotion_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `Promotion`(`promotion_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
