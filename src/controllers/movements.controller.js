import { pool } from '../../config/db.js';

// Obtener todos los movimientos
export const getMovements = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM movements');
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener un movimiento por ID
export const getMovement = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM movements WHERE id = $1', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Movimiento no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener movimientos filtrados por ID de producto (Historial por producto)
export const getMovementsByProductId = async (req, res) => {
    try {
        const { product_id } = req.params;
        const { rows } = await pool.query('SELECT * FROM movements WHERE product_id = $1', [product_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron movimientos para este producto' });
        }
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Registrar un nuevo movimiento
export const createMovement = async (req, res) => {
    try {
        const data = req.body;
        const queryText = 'INSERT INTO movements (product_id, warehouse_id, movement_type, quantity, movement_date) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        
        const values = [data.product_id, data.warehouse_id, data.movement_type, data.quantity, data.movement_date];

        const { rows } = await pool.query(queryText, values);
        
        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });       
    }
};

// Eliminar un registro de movimiento
export const deleteMovement = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM movements WHERE id = $1 RETURNING *', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Movimiento no encontrado' });
        }
        return res.json({ message: 'Movimiento eliminado correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Actualizar un movimiento existente
export const updateMovement = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const queryText = 'UPDATE movements SET product_id = $1, warehouse_id = $2, movement_type = $3, quantity = $4, movement_date = $5 WHERE id = $6 RETURNING *';

        const values = [data.product_id, data.warehouse_id, data.movement_type, data.quantity, data.movement_date, id];

        const { rows } = await pool.query(queryText, values);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Movimiento no encontrado' });
        }

        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};