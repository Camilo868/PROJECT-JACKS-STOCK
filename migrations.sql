-- migrations.sql
-- Pending changes on top of BDT + queries.sql, required for the
-- frontend to work fully. Run once against your Supabase database.

-- Allows marking a purchase order as pending/received/cancelled.
ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';

-- Allows saving a note/comment when logging a movement.
ALTER TABLE movements
  ADD COLUMN IF NOT EXISTS note VARCHAR(255);

-- Fixes deletes silently failing: right now, deleting a product,
-- warehouse, supplier, category, or purchase order fails with a
-- foreign key error if anything else references it (e.g. deleting a
-- product that already has inventory, movements, or purchase
-- history). This tells PostgreSQL what to do in that case: either
-- delete the dependent rows too (CASCADE), or just unlink them
-- (SET NULL) instead of blocking the delete.

-- Deleting a product also removes its inventory, movement, and
-- purchase-detail records (they don't make sense on their own).
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_product_id_fkey;
ALTER TABLE inventory ADD CONSTRAINT inventory_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE movements DROP CONSTRAINT IF EXISTS movements_product_id_fkey;
ALTER TABLE movements ADD CONSTRAINT movements_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE purchase_details DROP CONSTRAINT IF EXISTS purchase_details_product_id_fkey;
ALTER TABLE purchase_details ADD CONSTRAINT purchase_details_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Deleting a warehouse also removes its inventory and movement records.
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_warehouse_id_fkey;
ALTER TABLE inventory ADD CONSTRAINT inventory_warehouse_id_fkey
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE;

ALTER TABLE movements DROP CONSTRAINT IF EXISTS movements_warehouse_id_fkey;
ALTER TABLE movements ADD CONSTRAINT movements_warehouse_id_fkey
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE;

-- Deleting a purchase order also removes its line items.
ALTER TABLE purchase_details DROP CONSTRAINT IF EXISTS purchase_details_purchase_id_fkey;
ALTER TABLE purchase_details ADD CONSTRAINT purchase_details_purchase_id_fkey
  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE;

-- Deleting a category or supplier does NOT delete its products —
-- the product just loses that reference (category/supplier becomes empty).
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_supplier_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_supplier_id_fkey
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_supplier_id_fkey;
ALTER TABLE purchases ADD CONSTRAINT purchases_supplier_id_fkey
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

-- Deleting a user does NOT delete the warehouses they manage —
-- the warehouse just loses its assigned responsible user.
ALTER TABLE warehouses DROP CONSTRAINT IF EXISTS warehouse_user_id;
ALTER TABLE warehouses ADD CONSTRAINT warehouse_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
