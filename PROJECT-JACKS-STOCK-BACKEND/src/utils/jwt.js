/**
 * jwt.js
 * Helpers to sign and verify session tokens.
 */
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const EXPIRES_IN = '7d';

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
