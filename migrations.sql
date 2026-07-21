-- migrations.sql
-- Cambios pendientes sobre BDT + queries.sql, necesarios para que el
-- frontend funcione completo. Ejecutar una sola vez contra tu base de
-- datos de Supabase.

-- Permite marcar una orden de compra como pendiente/recibida/cancelada.
ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pendiente';
