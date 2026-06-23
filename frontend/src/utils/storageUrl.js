// utility buat bikin URL file storage
import { BASE_URL } from '@/services/api'

/**
 * Ubah path file jadi URL lengkap.
 * Bisa handle: null/undefined, URL lengkap (http), dan path relatif.
 * 
 * @param {string|null} path - path file (misal: "foto_barang/abc.jpg" atau "http://...")
 * @param {string|null} fallback - URL cadangan kalo path kosong (default: null)
 * @returns {string|null} URL lengkap ke file, atau fallback
 */
export function getStorageUrl(path, fallback = null) {
  if (!path) return fallback
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // hapus slash di depan biar gak dobel
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${BASE_URL}/storage/${cleanPath}`
}
