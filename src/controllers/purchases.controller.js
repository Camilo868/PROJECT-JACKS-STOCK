import { pool } from '../../config/db.js';

// Obtener todas las compras
export const getPurchases = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM purchases');
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener una compra por ID
export const getPurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM purchases WHERE id = $1', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Compra no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener compras filtradas por ID de proveedor (Historial por proveedor)
export const getPurchasesBySupplierId = async (req, res) => {
    try {
        const { supplier_id } = req.params;
        const { rows } = await pool.query('SELECT * FROM purchases WHERE supplier_id = $1', [supplier_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron compras para este proveedor' });
        }
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Registrar una nueva compra
export const createPurchase = async (req, res) => {
    try {
        const data = req.body;
        const queryText = `INSERT INTO purchases (supplier_id, purchase_date, total) VALUES ($1, $2, $3) RETURNING *`;
        
        const values = [data.supplier_id, data.purchase_date, data.total];

        const { rows } = await pool.query(queryText, values);
        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });       
    }
};

// Eliminar un registro de compra
export const deletePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM purchases WHERE id = $1 RETURNING *', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Compra no encontrada' });
        }
        return res.json({ message: 'Compra de inventario eliminada correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Actualizar una compra existente
export const updatePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const queryText = `UPDATE purchases SET supplier_id = $1, purchase_date = $2, total = $3 WHERE id = $4 RETURNING *`;

        const values = [data.supplier_id, data.purchase_date, data.total, id];

        const { rows } = await pool.query(queryText, values);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Compra no encontrada' });
        }

        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};