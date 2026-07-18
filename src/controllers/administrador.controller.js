import { pool } from '../../config/db.js';

export const getAdministradores = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM administrador');
    res.send(rows)};

export const getAdministrador = async (req, res) => {
    const { id } = req.params;
    const {rows} = await pool.query('SELECT * FROM administrador WHERE id = $1', [id]);

    if (rows.length === 0){
        return res.status(404).json({ message: 'administrador no encontrado'})
    }
    res.json(rows)
};

export const createAdministrador = async (req, res) => {
    try {
        const data = req.body;
        const { rows } = await pool.query('INSERT INTO administrador (nombre, email, password) VALUES ($1, $2, $3) RETURNING *', 
            [data.nombre, data.email, data.password])
        return res.json(rows[0])
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"})       
    }
};

export const deleteAdministrador = async (req, res) => {
    const { id } = req.params
    const { rows } = await pool.query('DELETE FROM administrador WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0){
        return res.status(404).json({ message: 'administrador no encontrado'})
    }
    return res.json({message: 'usuario eliminado'})
};

export const updateAdministrador = async (req, res) => {
    const { id } = req.params
    const data = req.body;

    const { rows } = await pool.query('UPDATE administrador SET nombre = $1, email = $2, password = $3 WHERE id = $4 RETURNING *', 
        [data.nombre, data.email, data.password, id])

    return res.json(rows[0])
};