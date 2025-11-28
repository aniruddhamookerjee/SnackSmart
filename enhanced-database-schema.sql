-- Enhanced SnackSmart Database Schema
CREATE DATABASE IF NOT EXISTS snacksmart_db;
USE snacksmart_db;

-- Drop existing tables
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS dishes;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

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
    phone VARCHAR(20),
    description TEXT,
    image_url VARCHAR(500),
    owner_id BIGINT,
    average_rating FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Dishes table
CREATE TABLE dishes (
    dish_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id BIGINT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category ENUM('VEG', 'NON_VEG') NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE reviews (
    review_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id BIGINT,
    user_id BIGINT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Sample data
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@snacksmart.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('john_owner', 'john@restaurant.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'OWNER'),
('jane_customer', 'jane@customer.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CUSTOMER'),
('mike_owner', 'mike@pizza.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'OWNER');

INSERT INTO restaurants (name, location, phone, description, image_url, owner_id, average_rating) VALUES
('Pizza Palace', '123 Main St, City Center', '+1-555-0101', 'Authentic Italian pizzas with fresh ingredients', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', 2, 4.5),
('Burger Barn', '456 Oak Ave, Downtown', '+1-555-0102', 'Gourmet burgers and sandwiches', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', 2, 4.2),
('Spice Garden', '789 Pine St, Uptown', '+1-555-0103', 'Traditional Indian cuisine with authentic spices', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', 4, 4.7);

INSERT INTO dishes (restaurant_id, name, description, price, category, image_url) VALUES
-- Pizza Palace dishes
(1, 'Margherita Pizza', 'Classic pizza with tomato, mozzarella, and basil', 12.99, 'VEG', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400'),
(1, 'Pepperoni Pizza', 'Pizza with pepperoni and cheese', 14.99, 'NON_VEG', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'),
(1, 'Veggie Supreme', 'Pizza loaded with fresh vegetables', 13.99, 'VEG', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400'),

-- Burger Barn dishes
(2, 'Classic Burger', 'Beef patty with lettuce, tomato, and cheese', 9.99, 'NON_VEG', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
(2, 'Veggie Burger', 'Plant-based patty with fresh vegetables', 8.99, 'VEG', 'https://images.unsplash.com/photo-1525059696034-4967a729002e?w=400'),
(2, 'Chicken Sandwich', 'Grilled chicken with mayo and lettuce', 10.99, 'NON_VEG', 'https://images.unsplash.com/photo-1606755962773-d324e9a13086?w=400'),

-- Spice Garden dishes
(3, 'Paneer Butter Masala', 'Creamy tomato curry with cottage cheese', 11.99, 'VEG', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400'),
(3, 'Chicken Biryani', 'Aromatic rice dish with spiced chicken', 13.99, 'NON_VEG', 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400'),
(3, 'Dal Tadka', 'Yellow lentils with aromatic spices', 8.99, 'VEG', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400');

INSERT INTO reviews (restaurant_id, user_id, rating, comment) VALUES
(1, 3, 5, 'Amazing pizza! Fresh ingredients and great taste.'),
(1, 3, 4, 'Good food but service could be faster.'),
(2, 3, 4, 'Love their veggie burger, very tasty!'),
(3, 3, 5, 'Best Indian food in town! Highly recommended.');