import { get, set, del, clear } from 'idb-keyval';

const PREFIX = 'ago_img_';

export async function guardarImagen(id, dataUrlOrBlob) {
  try {
    await set(`${PREFIX}${id}`, dataUrlOrBlob);
    return id;
  } catch (err) {
    console.error('Error guardando imagen en IndexedDB:', err);
    return null;
  }
}

export async function obtenerImagen(id) {
  try {
    return await get(`${PREFIX}${id}`);
  } catch (err) {
    console.error('Error obteniendo imagen de IndexedDB:', err);
    return null;
  }
}

export async function eliminarImagen(id) {
  try {
    await del(`${PREFIX}${id}`);
  } catch (err) {
    console.error('Error eliminando imagen de IndexedDB:', err);
  }
}

export async function limpiarTodasLasImagenes() {
  try {
    await clear();
  } catch (err) {
    console.error('Error limpiando IndexedDB:', err);
  }
}
