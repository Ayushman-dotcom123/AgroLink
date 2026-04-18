USE agrolink_db;

-- Sample users (passwords are bcrypt of 'demo123')
INSERT INTO users (name, email, password, phone, role, village, district, state) VALUES
('Admin User', 'admin@agrolink.in', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHi', '9999999999', 'admin', 'New Delhi', 'New Delhi', 'Delhi'),
('Ramesh Kumar', 'ramesh@farm.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHi', '9876543210', 'farmer', 'Karnal', 'Karnal', 'Haryana'),
('Suresh Patel', 'suresh@farm.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHi', '9876543211', 'farmer', 'Sehore', 'Sehore', 'Madhya Pradesh'),
('Lakshmi Devi', 'lakshmi@farm.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHi', '9876543212', 'farmer', 'Nashik', 'Nashik', 'Maharashtra'),
('Priya Sharma', 'priya@customer.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHi', '9876543213', 'customer', 'Connaught Place', 'New Delhi', 'Delhi'),
('Amit Kumar', 'amit@customer.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHi', '9876543214', 'customer', 'Bandra', 'Mumbai', 'Maharashtra');

-- Farmer profiles
INSERT INTO farmers (user_id, farm_size_acres, soil_type, is_approved, rating) VALUES
(2, 12.5, 'Alluvial', TRUE, 4.8),
(3, 8.0, 'Black', TRUE, 4.5),
(4, 5.5, 'Loamy', TRUE, 4.7);

-- Farms
INSERT INTO farms (farmer_id, name, village, district, state, soil_type, size_acres) VALUES
(2, 'Ramesh Farm', 'Karnal', 'Karnal', 'Haryana', 'Alluvial', 12.5),
(3, 'Patel Agro Farm', 'Sehore', 'Sehore', 'Madhya Pradesh', 'Black', 8.0),
(4, 'Green Valley Farm', 'Nashik', 'Nashik', 'Maharashtra', 'Loamy', 5.5);

-- Crop listings
INSERT INTO crops (farmer_id, name, category, price_per_kg, quantity_kg, is_organic, harvest_date, season, description) VALUES
(2, 'Basmati Rice', 'Grains', 85.00, 500, TRUE, '2024-11-15', 'Kharif', 'Premium quality long grain aromatic Basmati rice from Karnal'),
(2, 'Wheat (HD-2967)', 'Grains', 32.00, 1000, FALSE, '2025-04-10', 'Rabi', 'High yielding wheat variety, suitable for chapati and bread'),
(3, 'Soybean', 'Pulses', 55.00, 400, FALSE, '2024-11-20', 'Kharif', 'Fresh soybean from Madhya Pradesh black soil farms'),
(4, 'Tomatoes', 'Vegetables', 28.00, 200, TRUE, '2024-12-01', 'Rabi', 'Organic tomatoes grown without chemical pesticides'),
(4, 'Onions', 'Vegetables', 22.00, 800, FALSE, '2024-11-20', 'Rabi', 'Fresh red onions from Nashik, India\'s onion capital');

-- Sample inventory
INSERT INTO inventory (farmer_id, name, category, quantity, unit, min_stock, cost_per_unit) VALUES
(2, 'Wheat Seeds HD-2967', 'Seeds', 50, 'kg', 20, 45),
(2, 'Urea Fertilizer', 'Fertilizers', 5, 'bags', 10, 280),
(2, 'DAP Fertilizer', 'Fertilizers', 15, 'bags', 8, 1350),
(3, 'Soybean Seeds', 'Seeds', 30, 'kg', 15, 65),
(4, 'Tomato Seeds', 'Seeds', 10, 'kg', 5, 120);

-- Sample expenses
INSERT INTO expenses (farmer_id, date, category, description, amount, type) VALUES
(2, '2024-11-01', 'Seeds', 'Wheat seeds purchase', 2250, 'expense'),
(2, '2024-11-05', 'Fertilizers', 'Urea 5 bags', 1400, 'expense'),
(2, '2024-11-15', 'Crop Sales', 'Rice sale 200kg', 17000, 'income'),
(2, '2024-11-25', 'Crop Sales', 'Wheat sale 500kg', 16000, 'income'),
(3, '2024-11-10', 'Labor', 'Harvesting labor', 3500, 'expense'),
(3, '2024-11-20', 'Crop Sales', 'Soybean sale 300kg', 16500, 'income');
