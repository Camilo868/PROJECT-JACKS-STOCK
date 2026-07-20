import { pool } from '../../config/db.js';

// Obtener todos los detalles de compras
export const getPurchaseDetails = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM purchase_details');
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener un detalle de compra por su ID único
export const getPurchaseDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM purchase_details WHERE id = $1', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Detalle de compra no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener todos los detalles pertenecientes a una compra específica (purchase_id)
export const getDetailsByPurchaseId = async (req, res) => {
    try {
        const { purchase_id } = req.params;
        const { rows } = await pool.query('SELECT * FROM purchase_details WHERE purchase_id = $1', [purchase_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron detalles para esta compra' });
        }
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Crear un nuevo detalle de compra
export const createPurchaseDetail = async (req, res) => {
    try {
        const data = req.body;

        const { rows } = await pool.query('INSERT INTO purchase_details (purchase_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4) RETURNING *',
            [data.purchase_id, data.product_id, data.quantity, data.unit_price]);

        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });       
    }
};

// Eliminar un detalle de compra
export const deletePurchaseDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM purchase_details WHERE id = $1 RETURNING *', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Detalle de compra no encontrado' });
        }
        return res.json({ message: 'Detalle de compra eliminado correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Actualizar un detalle de compra existente
export const updatePurchaseDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const queryText = 'UPDATE purchase_details SET purchase_id = $1, product_id = $2, quantity = $3, unit_price = $4 WHERE id = $5 RETURNING *';

        const values = [data.purchase_id, data.product_id, data.quantity, data.unit_price, id];

        const { rows } = await pool.query(queryText, values);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Detalle de compra no encontrado' });
        }

        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};