import { pool } from '../../config/db.js';

// Obtener todas las categorías
export const getCategories = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener una categoría por ID
export const getCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener una categoría por su Nombre
export const getCategoryByName = async (req, res) => {
    try {
        const { name } = req.params;
        const { rows } = await pool.query('SELECT * FROM categories WHERE name = $1', [name]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Crear una nueva categoría
export const createCategory = async (req, res) => {
    try {
        const data = req.body;
        const { rows } = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [data.name]);
        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });       
    }
};

// Eliminar una categoría
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        return res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Actualizar una categoría existente
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const { rows } = await pool.query('UPDATE categories SET name = $1 WHERE id = $2 RETURNING *', [data.name, id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};