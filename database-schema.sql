-- SnackSmart Database Schema
CREATE DATABASE IF NOT EXISTS snacksmart_db;
USE snacksmart_db;

-- Users table
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('CUSTOMER', 'OWNER', 'ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants table
CREATE TABLE restaurants (
    restaurant_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    owner_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Dishes table
CREATE TABLE dishes (
    dish_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id BIGINT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- Sample data
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@snacksmart.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('john_owner', 'john@restaurant.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'OWNER'),
('jane_customer', 'jane@customer.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CUSTOMER');

INSERT INTO restaurants (name, location, owner_id) VALUES
('Pizza Palace', '123 Main St, City Center', 2),
('Burger Barn', '456 Oak Ave, Downtown', 2);

INSERT INTO dishes (restaurant_id, name, description, price, category, image_url) VALUES
(1, 'Margherita Pizza', 'Classic pizza with tomato, mozzarella, and basil', 12.99, 'Pizza', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400'),
(1, 'Pepperoni Pizza', 'Pizza with pepperoni and cheese', 14.99, 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'),
(2, 'Classic Burger', 'Beef patty with lettuce, tomato, and cheese', 9.99, 'Burger', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
(2, 'Chicken Sandwich', 'Grilled chicken with mayo and lettuce', 8.99, 'Sandwich', 'https://images.unsplash.com/photo-1606755962773-d324e9a13086?w=400');