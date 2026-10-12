// Datos que usa la página al construirse.
import videos from '../data/videos.json';

// Las noticias las publica el bot de MP-YT-Discord, que guarda las últimas en noticias_web.json
const NOTICIAS_URL = 'https://raw.githubusercontent.com/JoseLuisMD/MP-YT-Discord/main/noticias_web.json';

export async function cargarNoticias() {
  try {
    const r = await fetch(NOTICIAS_URL);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.warn(`No se pudieron cargar las noticias: ${e.message}`);
    return [];
  }
}

export function cargarVideos() {
  return {
    videos: videos.filter((v) => !v.short),
    shorts: videos.filter((v) => v.short),
  };
}

// Miniaturas de YouTube. Los Shorts solo tienen portada horizontal: se recorta el centro 9:16 con weserv
// (el mismo truco que usa el bot para Threads).
export const miniatura = (id, calidad = 'hqdefault') => `https://i.ytimg.com/vi/${id}/${calidad}.jpg`;
export const portadaShort = (id) =>
  `https://images.weserv.nl/?url=i.ytimg.com/vi/${id}/maxresdefault.jpg&w=270&h=480&fit=cover&a=center&output=webp` +
  `&default=${encodeURIComponent(miniatura(id))}`;

const FORMATO_FECHA = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
export const fechaCorta = (iso) => FORMATO_FECHA.format(new Date(iso));

// Une la ruta base de la web (import.meta.env.BASE_URL) con una ruta de /public
export const ruta = (p) => import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + p.replace(/^\//, '');

// Favicon de la web de una noticia (servicio de Google: devuelve un globo genérico si la web no tiene)
export const favicon = (enlace) => `https://www.google.com/s2/favicons?domain=${new URL(enlace).hostname}&sz=32`;
