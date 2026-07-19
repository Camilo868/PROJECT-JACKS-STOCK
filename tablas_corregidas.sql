--TABLE of the user: this user accesses the database.
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);


--Table with the diferent categories of products
CREATE TABLE categories(
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL
);


--Table where the suppliers will be recorded
CREATE TABLE suppliers(
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(120) NOT NULL,
    contact_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(120)
);

--Table with the warehouse
CREATE TABLE warehouses(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location TEXT,
    capacity INTEGER
);

--Table of products and here are very important information to the EOQ and the ROP
CREATE TABLE products(

    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id),
    supplier_id INT REFERENCES suppliers(id),
    name VARCHAR(120) NOT NULL,
    description TEXT,
    unit_price NUMERIC(10,2),
    annual_demand INTEGER,  
    ordering_cost NUMERIC(10,2),
    holding_cost NUMERIC(10,2),
    lead_time_days INTEGER,
    daily_demand NUMERIC(10,2)
);


--table ith the inventory, this table is connected with warehouse and products
CREATE TABLE inventory(
    id SERIAL PRIMARY KEY,
    warehouse_id INT REFERENCES warehouses(id),
    product_id INT REFERENCES products(id),
    quantity INTEGER DEFAULT 0
);


--Table table showing the purchase from a supplier
CREATE TABLE purchases(
    id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES suppliers(id),
    purchase_date DATE DEFAULT CURRENT_DATE,
    total NUMERIC(10,2)
);

--The products inclued in a purchase
CREATE TABLE purchase_details(
    id SERIAL PRIMARY KEY,
    purchase_id INT REFERENCES purchases(id),
    product_id INT REFERENCES products(id),
    quantity INTEGER,
    unit_price NUMERIC(10,2)
);

--Table with the movements (to see the history)
CREATE TABLE movements(
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    warehouse_id INT REFERENCES warehouses(id),
    movement_type VARCHAR(20),
    quantity INTEGER,
    movement_date DATE DEFAULT CURRENT_DATE
);

ALTER TABLE public.warehouses
add column user_id integer;

ALTER TABLE public.warehouses
add constraint warehouse_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);

-- 1. Borrar todos los datos de las tablas en orden correcto (para respetar las llaves foráneas)
TRUNCATE TABLE 
    purchase_details, purchases, movements, inventory, 
    products, warehouses, suppliers, categories, users 
RESTART IDENTITY CASCADE;

-- 2. Ahora que todo está en 1, vuelve a insertar tus datos iniciales
INSERT INTO users (name, last_name, email, password) VALUES
('Juan', 'Pérez', 'juan.perez@empresa.com', '$2b$12$EjemploHashPassword1'),
('María', 'Gómez', 'maria.gomez@empresa.com', '$2b$12$EjemploHashPassword2');
select * from users

INSERT INTO categories (name) VALUES
('Electrónica'),
('Oficina y Papelería'),
('Herramientas');
select * from categories 

INSERT INTO suppliers (company_name, contact_name, phone, email) VALUES
('TechDistribuidora S.A.', 'Carlos Mendoza', '+573001234567', 'ventas@techdist.com'),
('Papelera Central', 'Ana Martínez', '+573119876543', 'contacto@papeleracentral.com');
select * from suppliers


INSERT INTO warehouses (name, location, capacity, user_id) VALUES
('Almacén Central', 'Calle 10 #45-20, Bogotá', 5000, 1),
('Bodega Norte', 'Av. Industrial #88, Medellín', 2500, 2);
select * from warehouses 

-- Products (Including EOQ parameters)
INSERT INTO products (category_id, supplier_id, name, description, unit_price, annual_demand, ordering_cost, holding_cost, lead_time_days, daily_demand) VALUES
(1, 1, 'HP Laptop', 'Core i5 Processor, 8GB RAM', 2500000.00, 1200, 50000, 10000, 5, 3.28),
(2, 2, 'Bond Paper A4', '500 sheets ream', 25000.00, 5000, 5000, 500, 2, 13.69);
select * from products

INSERT INTO inventory (warehouse_id, product_id, quantity) VALUES
(1, 1, 50),
(1, 2, 200),
(2, 2, 100);
select * from inventory

INSERT INTO purchases (supplier_id, total) VALUES
(1, 12500000.00);

INSERT INTO purchase_details (purchase_id, product_id, quantity, unit_price) VALUES
(1, 1, 5, 2500000.00);
select * from purchase_details

INSERT INTO movements (product_id, warehouse_id, movement_type, quantity, movement_date) VALUES
(1, 1, 'IN', 50, '2026-07-15'),  -- Entrada inicial de Laptop HP en Main Warehouse
(2, 1, 'IN', 200, '2026-07-16'), -- Entrada inicial de Bond Paper en Main Warehouse
(2, 2, 'IN', 100, '2026-07-16'), -- Entrada inicial de Bond Paper en Secondary Warehouse
(1, 1, 'OUT', 5, '2026-07-18'),  -- Salida de 5 Laptops
(2, 1, 'OUT', 20, '2026-07-19'); -- Salida de 20 hojas Bond
select * from movements
