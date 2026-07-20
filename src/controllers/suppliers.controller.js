import { pool } from '../../config/db.js';

// Obtener todos los proveedores
export const getSuppliers = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM suppliers');
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener un proveedor por ID
export const getSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Obtener un proveedor por el Nombre de la Empresa
export const getSupplierByCompanyName = async (req, res) => {
    try {
        const { company_name } = req.params;
        const { rows } = await pool.query('SELECT * FROM suppliers WHERE company_name = $1', [company_name]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado con ese nombre de empresa' });
        }
        res.json(rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Crear un nuevo proveedor
export const createSupplier = async (req, res) => {
    try {
        const data = req.body;
        const queryText = 'INSERT INTO suppliers (company_name, contact_name, phone, email) VALUES ($1, $2, $3, $4) RETURNING *';
        
        const values = [data.company_name, data.contact_name, data.phone, data.email];

        const { rows } = await pool.query(queryText, values);
        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });       
    }
};

// Eliminar un proveedor
export const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        return res.json({ message: 'Proveedor eliminado correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Actualizar un proveedor existente
export const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const queryText = 'UPDATE suppliers SET company_name = $1, contact_name = $2, phone = $3, email = $4 WHERE id = $5 RETURNING *';

        const values = [data.company_name, data.contact_name, data.phone, data.email, id];

        const { rows } = await pool.query(queryText, values);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};