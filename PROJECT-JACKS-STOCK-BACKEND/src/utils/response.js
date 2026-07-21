/**
 * response.js
 * Standard response envelope used across all endpoints, so every
 * client always receives the same shape:
 *   { success: boolean, message: string, data: any }
 */

export function ok(res, data = null, message = 'Data obtained successfully', status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function created(res, data, message = 'Resource created successfully') {
  return ok(res, data, message, 201);
}

export function fail(res, message = 'Internal server error', status = 500, data = null) {
  return res.status(status).json({ success: false, message, data });
}

export function notFound(res, message = 'Resource not found') {
  return fail(res, message, 404);
}
