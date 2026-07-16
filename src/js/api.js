// Aquí van todas las funciones que hablan con tu backend (Python/Express).
// Ejemplo de patrón que vas a repetir para cada endpoint:

const BASE_URL = 'http://localhost:8000'; // cambia esto por la URL real de tu backend

export async function getProductos() {
  try {
    const res = await fetch(`${BASE_URL}/productos`);
    if (!res.ok) throw new Error('Error al obtener productos');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// export async function crearProducto(data) { ... }
// export async function actualizarProducto(id, data) { ... }
// export async function eliminarProducto(id) { ... }
