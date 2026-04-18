-- AgroLink Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS agrolink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agrolink_db;

-- Users table (farmers, customers, admins)
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  role ENUM('farmer', 'customer', 'admin') NOT NULL DEFAULT 'customer',
  village VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  profile_image VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Farmers extended profile
CREATE TABLE IF NOT EXISTS farmers (
  farmer_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  farm_size_acres DECIMAL(10,2) DEFAULT 0,
  soil_type VARCHAR(50),
  is_approved BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  bank_account VARCHAR(20),
  ifsc_code VARCHAR(15),
  upi_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Farms
CREATE TABLE IF NOT EXISTS farms (
  farm_id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  village VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  soil_type VARCHAR(50),
  size_acres DECIMAL(10,2),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Crops marketplace listings
CREATE TABLE IF NOT EXISTS crops (
  crop_id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  category ENUM('Grains','Vegetables','Fruits','Pulses','Spices','Oilseeds','Flowers','Other') NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  min_order_kg DECIMAL(10,2) DEFAULT 1,
  is_organic BOOLEAN DEFAULT FALSE,
  harvest_date DATE,
  sowing_date DATE,
  season ENUM('Kharif','Rabi','Zaid','Year-round'),
  expected_yield DECIMAL(10,2),
  description TEXT,
  image_url VARCHAR(255),
  is_available BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0,
  total_sold DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_category (category),
  INDEX idx_available (is_available),
  INDEX idx_farmer (farmer_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  delivery_address JSON,
  payment_method ENUM('razorpay','upi','cod') DEFAULT 'razorpay',
  payment_id VARCHAR(100),
  status ENUM('Pending','Confirmed','Packed','Out for Delivery','Delivered','Cancelled') DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(user_id),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status)
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  crop_id INT NOT NULL,
  farmer_id INT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (crop_id) REFERENCES crops(crop_id),
  FOREIGN KEY (farmer_id) REFERENCES users(user_id)
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  inventory_id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  category ENUM('Seeds','Fertilizers','Pesticides','Tools','Equipment','Other') NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'kg',
  min_stock DECIMAL(10,2) DEFAULT 0,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Expenses & Revenue
CREATE TABLE IF NOT EXISTS expenses (
  expense_id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(50),
  description VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  type ENUM('expense','income') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_farmer_date (farmer_id, date)
);

-- Weather cache
CREATE TABLE IF NOT EXISTS weather_cache (
  cache_id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  data JSON NOT NULL,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_city (city)
);

-- AI Recommendations log
CREATE TABLE IF NOT EXISTS recommendations (
  rec_id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT,
  input_data JSON,
  recommendations JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  txn_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  payment_id VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  method ENUM('razorpay','upi','cod'),
  status ENUM('pending','success','failed','refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- ── Chatbot Tables ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chatbot_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS chatbot_training (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category)
);

CREATE TABLE IF NOT EXISTS chatbot_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timestamp (timestamp)
);

-- ── Notifications Table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info','success','warning','order') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read)
);
