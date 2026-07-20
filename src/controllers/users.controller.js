import { pool } from '../../config/db.js';

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM users');
    res.send(rows)};

// Obtener un usuario por ID
export const getUser = async (req, res) => {
    const { id } = req.params;
    const {rows} = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (rows.length === 0){
        return res.status(404).json({ message: 'users no encontrado'})
    }
    res.json(rows)
};

// Obtener un usuario por su Nombre
export const getUserByName = async (req, res) => {
    const { name } = req.params;
    const {rows} = await pool.query('SELECT * FROM users WHERE name = $1', [name]);

    if (rows.length === 0){
        return res.status(404).json({ message: 'users no encontrado'})
    }
    res.json(rows)
};

// Crear un nuevo usuario
export const createUser = async (req, res) => {
    try {
        const data = req.body;
        const { rows } = await pool.query('INSERT INTO users (name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *', 
            [data.name, data.last_name, data.email, data.password])
        return res.json(rows[0])
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"})       
    }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
    const { id } = req.params
    const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0){
        return res.status(404).json({ message: 'users no encontrado'})
    }
    return res.json({message: 'usuario eliminado'})
};

// Actualizar un usuario existente
export const updateUser = async (req, res) => {
    const { id } = req.params
    const data = req.body;

    const { rows } = await pool.query('UPDATE users SET name = $1, last_name = $2, email = $3, password = $4 WHERE id = $5 RETURNING *', 
        [data.name, data.last_name, data.email, data.password, id])

    return res.json(rows[0])
};