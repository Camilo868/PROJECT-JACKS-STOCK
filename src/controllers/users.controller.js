import { pool } from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


// login con hash
export const login = async (req, res) => { 
    try {
        const { email, password } = req.body;
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const match = await bcrypt.compare(password, user.rows[0].password);
        
        if (!match) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        return res.json({message:'Login exitoso'});

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users');
        res.json(rows);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

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

// Crear un nuevo usuario con hash
export const createUser = async (req, res) => {
    try {
        const data = req.body;
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const { rows } = await pool.query('INSERT INTO users (name, last_name, email, password) VALUES ($1, $2, $3, $4)', 
            [data.name, data.last_name, data.email, hashedPassword]);

        return res.json({message: 'usuario creado'})
    } catch (error) {
        console.log(error);

        if (error.code === '23505') {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        };
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