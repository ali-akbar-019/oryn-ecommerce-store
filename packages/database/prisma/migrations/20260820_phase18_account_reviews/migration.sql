-- Phase 18: enforce one customer review per product.
ALTER TABLE `Review` ADD CONSTRAINT `Review_productId_userId_key` UNIQUE (`productId`, `userId`);
