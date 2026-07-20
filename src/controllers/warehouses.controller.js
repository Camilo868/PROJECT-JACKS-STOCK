import { pool } from '../../config/db.js';

// Obtener todos los almacenes
export const getWarehouses = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM warehouses');
    res.send(rows)};

// Obtener un almacén por ID
export const getWarehouse = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM Warehouses WHERE id = $1', [id]);

    if (rows.length === 0){
        return res.status(404).json({ message: 'Warehouse no encontrado'})
    }
    res.json(rows)
};

// Obtener un almacén por su Nombre
export const getWarehouseByName = async (req, res) => {
    const { name } = req.params;
    const { rows } = await pool.query('SELECT * FROM warehouses WHERE name = $1', [name]);

    if (rows.length === 0){
        return res.status(404).json({ message: 'users no encontrado'})
    }
    res.json(rows)
};

// Crear un nuevo almacén
export const createWarehouse = async (req, res) => {
    try {
        const data = req.body;
        const { rows } = await pool.query('INSERT INTO warehouses (name, location, capacity, user_id) VALUES ($1, $2, $3, $4) RETURNING *', 
            [data.name, data.location, data.capacity, data.user_id])
        return res.json(rows[0])
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"})       
    }
};

// Eliminar un almacén
export const deleteWarehouse = async (req, res) => {
    const { id } = req.params
    const { rows } = await pool.query('DELETE FROM Warehouses WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0){
        return res.status(404).json({ message: 'Warehouses no encontrado'})
    }
    return res.json({message: 'usuario eliminado'})
};

// Actualizar un almacén existente
export const updateWarehouse = async (req, res) => {
    const { id } = req.params
    const data = req.body;

    const { rows } = await pool.query('UPDATE Waterhouses SET name = $1, last_name = $2, email = $3, password = $4 WHERE id = $5 RETURNING *', 
        [data.name, data.location, data.capacity, data.user_id, id])

    return res.json(rows[0])
};