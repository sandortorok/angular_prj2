-- MySQL dump 10.13  Distrib 8.0.33, for Linux (x86_64)
--
-- Host: localhost    Database: nest-nh3
-- ------------------------------------------------------
-- Server version	8.0.33-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ErrorMessage`
--

DROP TABLE IF EXISTS `ErrorMessage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ErrorMessage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ErrorMessage`
--

LOCK TABLES `ErrorMessage` WRITE;
/*!40000 ALTER TABLE `ErrorMessage` DISABLE KEYS */;
INSERT INTO `ErrorMessage` VALUES (1,'teszt message','1970-01-01 00:00:00.000'),(2,'teszt message 2','1970-01-01 00:00:00.000'),(3,'ehy','2023-05-11 07:54:40.727');
/*!40000 ALTER TABLE `ErrorMessage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sensor`
--

DROP TABLE IF EXISTS `Sensor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sensor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `horn` tinyint(1) NOT NULL DEFAULT '0',
  `address` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Sensor_address_key` (`address`),
  UNIQUE KEY `Sensor_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sensor`
--

LOCK TABLES `Sensor` WRITE;
/*!40000 ALTER TABLE `Sensor` DISABLE KEYS */;
INSERT INTO `Sensor` VALUES (1,'Sensor 1',1,1),(2,'Sensor 2',0,2),(3,'ASensor 3',0,3),(4,'Sensor 4',0,4),(5,'Sensor 5',0,5),(10,'Sensor 6',0,6),(11,'Sensor 7',0,7),(12,'Sensor 8',0,8),(13,'Sensor 9',0,9),(14,'Sensor 10',0,10),(17,'Sensor 11',1,11);
/*!40000 ALTER TABLE `Sensor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SensorHistory`
--

DROP TABLE IF EXISTS `SensorHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SensorHistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` datetime(3) NOT NULL,
  `value` double NOT NULL,
  `sensorId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `SensorHistory_sensorId_fkey` (`sensorId`),
  CONSTRAINT `SensorHistory_sensorId_fkey` FOREIGN KEY (`sensorId`) REFERENCES `Sensor` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SensorHistory`
--

LOCK TABLES `SensorHistory` WRITE;
/*!40000 ALTER TABLE `SensorHistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `SensorHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Siren`
--

DROP TABLE IF EXISTS `Siren`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Siren` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `muted` tinyint(1) NOT NULL DEFAULT '0',
  `address` int NOT NULL DEFAULT '0',
  `on` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Siren_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Siren`
--

LOCK TABLES `Siren` WRITE;
/*!40000 ALTER TABLE `Siren` DISABLE KEYS */;
INSERT INTO `Siren` VALUES (1,'Siren 1',0,0,0),(2,'Siren 2',0,20,0),(3,'Siren 3',0,21,0);
/*!40000 ALTER TABLE `Siren` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tesztmode`
--

DROP TABLE IF EXISTS `Tesztmode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tesztmode` (
  `id` int NOT NULL DEFAULT '1',
  `isOn` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tesztmode`
--

LOCK TABLES `Tesztmode` WRITE;
/*!40000 ALTER TABLE `Tesztmode` DISABLE KEYS */;
INSERT INTO `Tesztmode` VALUES (1,0);
/*!40000 ALTER TABLE `Tesztmode` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('01b92638-34d9-482a-be09-e9c1c87953d7','d0b5b80fb85dfe26699709ea16fbc5d1aff510f22ff163690c8a77f7e688f7ae','2023-05-04 12:04:55.800','20230504120455_on_off_address_on_sirens',NULL,NULL,'2023-05-04 12:04:55.762',1),('060cc49b-33dd-4c7f-8315-62fa89ec9687','ce599bae57377ab8d2b6359a88ffcc9beaccf4bbc24bdfe0011426307f229f0a','2023-03-30 07:18:49.621','20230330071849_add_unique_to_adress',NULL,NULL,'2023-03-30 07:18:49.605',1),('1d680a89-e97b-4c26-a008-30ee9866d880','c70508a4ee8f9067c3812132e85c9aa4a20e0f740f11be0e079c44e36d508c2b','2023-03-30 07:17:29.603','20230327083001_init2',NULL,NULL,'2023-03-30 07:17:29.571',1),('20a59013-0996-4363-9a1e-b18d5e08a924','89b231a8f21f8bf16f197faf439a9183026100b48ab073ca4a05d9b543d12642','2023-05-11 07:54:13.556','20230511075413_default_now_errormessage',NULL,NULL,'2023-05-11 07:54:13.538',1),('3976a955-01f8-4d3f-8231-9aa75e856a69','6117c7d102d03305e510611a27499cd728f770070c8f94ff4ea91cef3f8b63d1','2023-03-30 07:17:51.421','20230330071737_rename_number_to_adress',NULL,NULL,'2023-03-30 07:17:51.405',1),('3f4e9f62-1fa4-4032-8dac-b2fc0eaa22f1','34af23d5900b612f8a09d9a123befb14bdb52a0509ca0374b0ba3632e37e7760','2023-03-30 13:26:42.739','20230330132642_unique_name',NULL,NULL,'2023-03-30 13:26:42.712',1),('5bfb7a6d-bf66-43c1-8584-20e8082b1888','1219f4e423990f85f1981efe1063a79f9896f189e3eb737b20fbf26ba5839f1e','2023-04-06 07:08:03.807','20230406070803_add_siren',NULL,NULL,'2023-04-06 07:08:03.755',1),('603f0134-53f0-4839-82f2-ee9d54decd8c','07f9d9c1e034a8a63ad37b74cf5115948caf2bd4b4a9d40a18dc1496b5baeb88','2023-05-04 16:00:18.117','20230504160018_address_integer',NULL,NULL,'2023-05-04 16:00:18.053',1),('b0c38d35-39fb-4e02-9f91-82f740c70538','16db70378458a9bfdb66949bd3608cfd237daee0098e28cf841d92efc71364ce','2023-05-04 15:57:50.896','20230504155750_siren_update',NULL,NULL,'2023-05-04 15:57:50.851',1),('bec06b22-6a6e-497d-8169-b96f6211e4b3','eedff646df29f8b9ad27946bf9108308aa88ec10e1d4fb2d9dbf563d54fbab36','2023-03-30 07:17:29.634','20230330071624_rename_number_to_adress',NULL,NULL,'2023-03-30 07:17:29.605',1),('c4d81378-7a95-4b58-95e6-aa815bfbaf27','1f508da9bf3c649ca41bcafd4d8fcdcba44c67dd6c6ea3ed7662bc227d1d2e3f','2023-05-08 13:25:16.083','20230508132516_create_tesztmode',NULL,NULL,'2023-05-08 13:25:16.061',1),('cb008d94-f7b8-4f62-a98b-61907654dd97','82b51926300d3a54adca8b86faafecb4936c5afd05d57553fe4e695b2cd0cd9d','2023-04-06 07:20:37.692','20230406072037_not_unique_address',NULL,NULL,'2023-04-06 07:20:37.670',1),('d5b7ef93-75c5-469d-b53c-01b63871be22','55b5e500944ac282df6a15f231ab39c2dd86972e690aee9f17a14ce6e3e15ab8','2023-04-06 07:19:46.916','20230406071946_address_int_to_string',NULL,NULL,'2023-04-06 07:19:46.840',1),('e08f61b9-7dc7-4760-8c5e-2bb83dc66041','03dd7ca5a82e312e302d28632911efe73c2cb18b6113a72d3556929927f8fa97','2023-05-11 07:09:16.086','20230511070916_add_error_message',NULL,NULL,'2023-05-11 07:09:16.062',1),('fa60315a-951b-4cfe-9a2b-b61da3c68b28','17926c5663e8463fa01a1d87e6bd7f4d209c6536b712912611376c78873cbfa1','2023-03-30 07:17:29.568','20230327082920_init',NULL,NULL,'2023-03-30 07:17:29.496',1),('ffde956f-b780-4f66-86c9-62a3624aa4df','c9ee35c6f558e167c7f031f63b33a321c91e91ece54c89e931e84d1b98a1e8c1','2023-03-30 07:19:10.752','20230330071910_adress_to_address',NULL,NULL,'2023-03-30 07:19:10.707',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-05-15 14:38:32
