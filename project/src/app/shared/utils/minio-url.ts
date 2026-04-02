import { environment } from '../../../environments/environment';

/**
 * Construye la URL completa para un thumbnail de MinIO
 * El bucket streamvault-thumbnails está configurado como público (read-only)
 * 
 * @param thumbnailKey - La clave del thumbnail devuelta por la API (ej: "Peliculas/Maquina-De-Guerra.jpg" o "streamvault-thumbnails/Peliculas/...")
 * @returns URL completa para acceder a la imagen, o null si no hay clave
 */
export function getThumbnailUrl(thumbnailKey: string | null | undefined): string | null {
  if (!thumbnailKey) {
    return null;
  }
  
  // Decodificar caracteres encoding si viene encoded
  let key = decodeURIComponent(thumbnailKey);
  
  // Si la key ya incluye el bucket name (streamvault-thumbnails/), no duplicar
  if (key.startsWith('streamvault-thumbnails/')) {
    key = key.replace('streamvault-thumbnails/', '');
  }
  
  // Eliminar cualquier / inicial para evitar doble slash
  const cleanKey = key.startsWith('/') ? key.substring(1) : key;
  
  return `${environment.minioPublicUrl}${cleanKey}`;
}

/**
 * Construye la URL para el backdrop (imagen de fondo más grande)
 * @param thumbnailKey - La clave del thumbnail
 * @returns URL del backdrop o null
 */
export function getBackdropUrl(thumbnailKey: string | null | undefined): string | null {
  const url = getThumbnailUrl(thumbnailKey);
  if (!url) return null;
  
  // Agregar parámetro para obtener imagen de mayor resolución si está disponible
  return url;
}

/**
 * Obtiene la URL del avatar de un perfil
 * @param avatarUrl - URL directa del avatar (puede venir null del backend)
 * @returns URL del avatar o placeholder por defecto
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) {
    return '/assets/images/default-avatar.png';
  }
  return avatarUrl;
}