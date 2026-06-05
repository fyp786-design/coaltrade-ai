-- CoalTrade AI: Intelligent Coal Trading
-- PostgreSQL Database Schema
-- University of Lahore - FYP Fall 2021-2026

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS trade_requests CASCADE;
DROP TABLE IF EXISTS coal_listings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    phone VARCHAR(20),
    company VARCHAR(100),
    location VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coal Listings Table
CREATE TABLE coal_listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    coal_type VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    quantity_unit VARCHAR(20) DEFAULT 'tons',
    price_per_ton DECIMAL(12,2) NOT NULL,
    location VARCHAR(150) NOT NULL,
    description TEXT,
    calorific_value DECIMAL(8,2),
    ash_content DECIMAL(5,2),
    moisture_content DECIMAL(5,2),
    sulfur_content DECIMAL(5,2),
    listing_type VARCHAR(20) DEFAULT 'sell' CHECK (listing_type IN ('sell', 'buy')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
    ai_predicted_price DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trade Requests Table
CREATE TABLE trade_requests (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES coal_listings(id) ON DELETE CASCADE,
    buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    quantity_requested DECIMAL(10,2) NOT NULL,
    offered_price DECIMAL(12,2),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_listings_user_id ON coal_listings(user_id);
CREATE INDEX idx_listings_status ON coal_listings(status);
CREATE INDEX idx_listings_coal_type ON coal_listings(coal_type);
CREATE INDEX idx_trade_requests_buyer ON trade_requests(buyer_id);
CREATE INDEX idx_trade_requests_seller ON trade_requests(seller_id);
CREATE INDEX idx_trade_requests_listing ON trade_requests(listing_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON coal_listings
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_trade_requests_updated_at BEFORE UPDATE ON trade_requests
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Seed: Admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, company, location)
VALUES (
    'Admin User',
    'admin@coaltrade.ai',
    '$2b$10$rOzJqxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'admin',
    'CoalTrade AI',
    'Lahore, Pakistan'
);

-- Seed: Sample regular user
INSERT INTO users (name, email, password_hash, role, company, location)
VALUES (
    'Test Trader',
    'trader@example.com',
    '$2b$10$rOzJqxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'user',
    'Pakistan Coal Corp',
    'Karachi, Pakistan'
);
