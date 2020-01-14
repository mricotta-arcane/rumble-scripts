-- phpMyAdmin SQL Dump
-- version 4.6.6
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 14, 2017 at 11:12 AM
-- Server version: 10.1.21-MariaDB
-- PHP Version: 7.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `data_miner`
--

-- --------------------------------------------------------

--
-- Table structure for table `raw`
--

CREATE TABLE `raw` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `data` text NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `studios`
--

CREATE TABLE `studios` (
  `id` int(11) NOT NULL,
  `studio_id` int(11) DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `site` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `timezone` varchar(255) NOT NULL,
  `seat` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `raw`
--
ALTER TABLE `raw`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `studios`
--
ALTER TABLE `studios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `raw`
--
ALTER TABLE `raw`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;
--
-- AUTO_INCREMENT for table `studios`
--
ALTER TABLE `studios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
