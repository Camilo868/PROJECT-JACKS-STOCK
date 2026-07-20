import { pool } from '../../config/db.js';

// Obtener todo el inventario
export const getInventories = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM inventory');
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener un registro de inventario por ID
export const getInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM inventory WHERE id = $1', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Registro de inventario no encontrado' });
        }
        res.json(rows[0]); // Devolvemos el objeto directamente en lugar del arreglo
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener registros de inventario por ID de producto (Reemplaza la búsqueda por nombre)
export const getInventoryByProductId = async (req, res) => {
    try {
        const { product_id } = req.params;
        const { rows } = await pool.query('SELECT * FROM inventory WHERE product_id = $1', [product_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron productos en el inventario' });
        }
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Crear un nuevo registro en el inventario
export const createInventory = async (req, res) => {
    try {
        const data = req.body;
        const { rows } = await pool.query('INSERT INTO inventory (warehouse_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *', 
            [data.warehouse_id, data.product_id, data.quantity]);

        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });       
    }
};

// Eliminar un registro de inventario
export const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Registro de inventario no encontrado' });
        }
        return res.json({ message: 'Registro de inventario eliminado correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Actualizar un registro de inventario
export const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const { rows } = await pool.query('UPDATE inventory SET warehouse_id = $1, product_id = $2, quantity = $3 WHERE id = $4 RETURNING *', 
            [data.warehouse_id, data.product_id, data.quantity, id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Registro de inventario no encontrado' });
        }

        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};