import { pool } from '../../config/db.js';

// Obtener todos los productos
export const getProducts = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener un producto por ID
export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener un producto por su Nombre
export const getProductByName = async (req, res) => {
    try {
        const { name } = req.params;
        const { rows } = await pool.query('SELECT * FROM products WHERE name = $1', [name]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Crear un nuevo producto
export const createProduct = async (req, res) => {
    try {
        const data = req.body;
        const queryText = `INSERT INTO products (category_id, supplier_id, name, description, unit_price, annual_demand, ordering_cost, 
            holding_cost, lead_time_days, daily_demand) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
        
        const values = [data.category_id, data.supplier_id, data.name, data.description, data.unit_price,data.annual_demand, data.ordering_cost, 
            data.holding_cost, data.lead_time_days, data.daily_demand];

        const { rows } = await pool.query(queryText, values);
        
        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });       
    }
};

// Eliminar un producto
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        return res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Actualizar un producto existente
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const queryText = `UPDATE products SET category_id = $1, supplier_id = $2, name = $3, description = $4, unit_price = $5, annual_demand = $6, 
            ordering_cost = $7, holding_cost = $8, lead_time_days = $9, daily_demand = $10 WHERE id = $11 RETURNING *`;

        const values = [data.category_id, data.supplier_id, data.name, data.description, data.unit_price,data.annual_demand, data.ordering_cost, 
            data.holding_cost, data.lead_time_days, data.daily_demand,id];

        const { rows } = await pool.query(queryText, values);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};