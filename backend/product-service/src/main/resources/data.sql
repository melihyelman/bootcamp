-- Sample product data for development
INSERT INTO products (name, description, price, stock_quantity, category, image_url, active, created_at, updated_at)
VALUES
    ('iPhone 15 Pro', '256GB, Titanium Blue', 64999.99, 50, 'Elektronik', 'https://via.placeholder.com/300', true, NOW(), NOW()),
    ('MacBook Air M3', '8GB RAM, 256GB SSD', 49999.99, 30, 'Elektronik', 'https://via.placeholder.com/300', true, NOW(), NOW()),
    ('Samsung Galaxy S24', '128GB, Phantom Black', 44999.99, 45, 'Elektronik', 'https://via.placeholder.com/300', true, NOW(), NOW()),
    ('Sony WH-1000XM5', 'Kablosuz Kulaklık', 8999.99, 100, 'Aksesuar', 'https://via.placeholder.com/300', true, NOW(), NOW()),
    ('Nike Air Max 270', 'Spor Ayakkabı, 42 Numara', 3499.99, 200, 'Giyim', 'https://via.placeholder.com/300', true, NOW(), NOW()),
    ('Kindle Paperwhite', '16GB, Su Geçirmez', 4999.99, 75, 'Elektronik', 'https://via.placeholder.com/300', true, NOW(), NOW()),
    ('Logitech MX Master 3S', 'Kablosuz Mouse', 2999.99, 150, 'Aksesuar', 'https://via.placeholder.com/300', true, NOW(), NOW()),
    ('Canon EOS R50', 'Aynasız Fotoğraf Makinesi', 29999.99, 20, 'Elektronik', 'https://via.placeholder.com/300', true, NOW(), NOW()),
    ('Dyson V15 Detect', 'Kablosuz Süpürge', 19999.99, 35, 'Ev & Yaşam', 'https://via.placeholder.com/300', true, NOW(), NOW()),
    ('LEGO Technic', 'Ferrari Daytona SP3', 12999.99, 25, 'Hobi', 'https://via.placeholder.com/300', true, NOW(), NOW())
ON CONFLICT DO NOTHING;
