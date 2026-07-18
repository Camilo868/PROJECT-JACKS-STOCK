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