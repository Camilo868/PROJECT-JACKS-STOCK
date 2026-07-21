import { pool } from '../../config/db.js';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt.js';
import { ok, created, fail, notFound } from '../utils/response.js';

function stripPassword(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

// Log in with hashed password comparison, returns a JWT + user data
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (rows.length === 0) {
      return fail(res, 'Incorrect email or password', 401);
    }

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) {
      return fail(res, 'Incorrect email or password', 401);
    }

    const user = stripPassword(rows[0]);
    const token = signToken(user);
    return ok(res, { token, user }, 'Login successful');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    return ok(res, rows.map(stripPassword));
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a user by ID
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (rows.length === 0) return notFound(res, 'User not found');
    return ok(res, stripPassword(rows[0]));
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Get a user by name
export const getUserByName = async (req, res) => {
  try {
    const { name } = req.params;
    const { rows } = await pool.query('SELECT * FROM users WHERE name = $1', [name]);

    if (rows.length === 0) return notFound(res, 'User not found');
    return ok(res, rows.map(stripPassword));
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Create a new user (registration), hashing the password before saving
export const createUser = async (req, res) => {
  try {
    const data = req.body;
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const { rows } = await pool.query(
      'INSERT INTO users (name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.name, data.last_name, data.email, hashedPassword],
    );

    const user = stripPassword(rows[0]);
    const token = signToken(user);
    return created(res, { token, user }, 'User created successfully');
  } catch (error) {
    console.log(error);
    if (error.code === '23505') {
      return fail(res, 'This email is already registered', 400);
    }
    return fail(res);
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) return notFound(res, 'User not found');
    return ok(res, null, 'User deleted successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};

// Update an existing user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const payload = { ...data };

    // Only re-hash the password if a new one was provided
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    } else {
      const { rows: current } = await pool.query('SELECT password FROM users WHERE id = $1', [id]);
      if (current.length === 0) return notFound(res, 'User not found');
      payload.password = current[0].password;
    }

    const { rows } = await pool.query(
      'UPDATE users SET name = $1, last_name = $2, email = $3, password = $4 WHERE id = $5 RETURNING *',
      [payload.name, payload.last_name, payload.email, payload.password, id],
    );

    if (rows.length === 0) return notFound(res, 'User not found');
    return ok(res, stripPassword(rows[0]), 'User updated successfully');
  } catch (error) {
    console.log(error);
    return fail(res);
  }
};
