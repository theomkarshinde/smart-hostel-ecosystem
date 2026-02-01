-- Smart Hostel Ecosystem - Database Schema
-- Version: 1.0

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0;

-- 1. Create Roles Table
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(20) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Roles Data
INSERT INTO `roles` (`role_id`, `role_name`) VALUES 
(1,'ADMIN'),
(2,'STUDENT'),
(3,'WARDEN'),
(4,'GUARD'),
(5,'STAFF');

-- 2. Create Users Table
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `idx_email` (`email`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Admin User (Username: admin, Password: password)
INSERT INTO `users` (`user_id`, `role_id`, `username`, `password_hash`, `is_active`, `email`) VALUES 
(1, 1, 'admin', '$2a$10$dcFpM4Qwdyn5IH.aqr3wHenosc5ML0sxdMldpHZN2zkFZgiugVUm.', 1, 'admin@hostel.com');

-- 3. Create Hostel Buildings Table
DROP TABLE IF EXISTS `hostel_buildings`;
CREATE TABLE `hostel_buildings` (
  `building_id` bigint NOT NULL AUTO_INCREMENT,
  `building_name` varchar(255) NOT NULL,
  `building_type` enum('BOYS','GIRLS','CO_ED') NOT NULL,
  `total_rooms` int NOT NULL,
  `total_capacity` int NOT NULL,
  `available_rooms` int NOT NULL,
  `fee` double DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`building_id`),
  UNIQUE KEY `building_name` (`building_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Students Table
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `student_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `building_id` bigint DEFAULT NULL,
  `room_number` varchar(255) DEFAULT NULL,
  `wallet_balance` double DEFAULT '0',
  `total_fee` double DEFAULT '0',
  `paid_fee` double DEFAULT '0',
  `emi_amount` double DEFAULT NULL,
  `is_emi_enabled` tinyint DEFAULT '0',
  `payment_method_selected` tinyint DEFAULT '0',
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_student_building` FOREIGN KEY (`building_id`) REFERENCES `hostel_buildings` (`building_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create Staff Table
DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff` (
  `staff_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `staff_type` enum('WARDEN','CLEANER','MESS','LAUNDRY','GUARD','ELECTRICIAN','PLUMBER') DEFAULT NULL,
  `manages_mess` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`staff_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_staff_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create Complaints Table
DROP TABLE IF EXISTS `complaints`;
CREATE TABLE `complaints` (
  `complaint_id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `building_id` bigint NOT NULL,
  `category` enum('HOSTEL','MESS','LAUNDRY','SECURITY','OTHER','WIFI','MAINTENANCE','CLEANLINESS','ELECTRIC') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','REJECTED') DEFAULT 'OPEN',
  `resolution_comment` varchar(1000) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`complaint_id`),
  CONSTRAINT `fk_complaint_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  CONSTRAINT `fk_complaint_building` FOREIGN KEY (`building_id`) REFERENCES `hostel_buildings` (`building_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Create Other Essential Tables (Definitions Only)
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `laundry_booking`;
CREATE TABLE `laundry_booking` (
  `booking_id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint DEFAULT NULL,
  `building_id` bigint DEFAULT NULL,
  `clothes_count` int DEFAULT NULL,
  `amount` decimal(38,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`booking_id`),
  CONSTRAINT `fk_laundry_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  CONSTRAINT `fk_laundry_building_ref` FOREIGN KEY (`building_id`) REFERENCES `hostel_buildings` (`building_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `student_attendance`;
CREATE TABLE `student_attendance` (
  `attendance_id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `building_id` bigint DEFAULT NULL,
  `attendance_date` date NOT NULL,
  `attendance_time` time NOT NULL,
  `attendance_type` enum('HOSTEL','MESS') NOT NULL,
  `hostel_action` enum('IN','OUT') DEFAULT NULL,
  `meal_type` enum('BREAKFAST','LUNCH','DINNER') DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attendance_id`),
  CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `notification_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_type` enum('HOSTEL','MESS','LAUNDRY','WALLET') DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  CONSTRAINT `fk_payment_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `visitors`;
CREATE TABLE `visitors` (
  `visitor_id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint DEFAULT NULL,
  `visitor_name` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `visit_date` datetime DEFAULT NULL,
  `in_time` datetime DEFAULT NULL,
  `out_time` datetime DEFAULT NULL,
  PRIMARY KEY (`visitor_id`),
  CONSTRAINT `fk_visitor_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `mess_plans`;
CREATE TABLE `mess_plans` (
  `plan_id` int NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(255) DEFAULT NULL,
  `per_meal_cost` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mess_plans` (`plan_id`, `plan_name`, `per_meal_cost`) VALUES 
(1,'Monthly Standard',50.00),
(2,'Monthly Premium',150.00);

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
SET SQL_NOTES=@OLD_SQL_NOTES;
