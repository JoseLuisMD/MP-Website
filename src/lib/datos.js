// Datos que usa la página al construirse.
import videos from '../data/videos.json';

// Las noticias las publica el bot de MP-YT-Discord, que guarda las últimas en noticias_web.json (en su rama «estado»)
const NOTICIAS_URL = 'https://raw.githubusercontent.com/JoseLuisMD/MP-YT-Discord/estado/noticias_web.json';
const esWeb = (url) => typeof url === 'string' && /^https?:\/\//i.test(url);

export async function cargarNoticias() {
  try {
    const r = await fetch(NOTICIAS_URL);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    // Solo enlaces web normales: si un feed trajera algo raro (p. ej. «javascript:»), la noticia se descarta
    return (await r.json())
      .filter((n) => esWeb(n.enlace))
      .map((n) => ({ ...n, imagen: esWeb(n.imagen) ? n.imagen : null }));
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

// Micro-reseñas del Conservador de Steam de Mundos Pixelados. Steam no tiene una API documentada para esto:
// se usa el mismo JSON con el que su tienda lista las recomendaciones de un conservador (trae el HTML de la lista).
// Si falla o cambia de formato, la sección no se muestra y el resto de la web se construye igual.
export const CONSERVADOR_STEAM = 'https://store.steampowered.com/curator/46111642/';
const RESENAS_URL = `${CONSERVADOR_STEAM}ajaxgetfilteredrecommendations/?query=&start=0&count=24&sort=recent&l=spanish`;
const VEREDICTOS = { recommended: 'recomendado', not_recommended: 'no-recomendado', informative: 'informativo' };

const textoDe = (html) =>
  (html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

function leerResena(bloque) {
  const tienda = bloque.match(/class="store_capsule[^"]*"[^>]*href="(https:\/\/store\.steampowered\.com\/app\/[^"?]+)/)?.[1];
  const imagen = bloque.match(/<img src="(https:\/\/[^"]+\/header_292x136\.jpg)[^"]*" alt="([^"]*)"/);
  const tipo = bloque.match(/class='color_(\w+)'>([^<]*)</);
  const texto = textoDe(bloque.match(/class="recommendation_desc">([\s\S]*?)<\/div>/)?.[1]);
  if (!tienda || !imagen || !texto) return null;
  return {
    juego: textoDe(imagen[2]),
    imagen: imagen[1].replace('header_292x136.jpg', 'header.jpg'),   // la cabecera grande (460×215)
    veredicto: VEREDICTOS[tipo?.[1]] ?? 'informativo',
    veredictoTexto: textoDe(tipo?.[2]) || 'Informativo',
    fecha: textoDe(bloque.match(/class="curator_review_date">([^<]*)</)?.[1]),
    texto,
    resena: bloque.match(/class="recommendation_readmore"><a href="(https?:\/\/[^"]+)"/)?.[1] ?? null,   // la reseña completa (vídeo)
    tienda,
  };
}

export async function cargarResenas() {
  try {
    const r = await fetch(RESENAS_URL, { headers: { 'Accept-Language': 'es-ES' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const { success, results_html, total_count } = await r.json();
    if (success !== 1 || typeof results_html !== 'string') throw new Error('respuesta inesperada');
    const resenas = results_html.split('class="recommendation"').slice(1).map(leerResena).filter(Boolean);
    return { resenas, total: Number(total_count) || null };   // total: cuántas reseñas tiene el conservador
  } catch (e) {
    console.warn(`No se pudieron cargar las reseñas de Steam: ${e.message}`);
    return { resenas: [], total: null };
  }
}

// Nombre corto para los eventos de clic de GoatCounter: «Comunidad Discord» → «comunidad-discord»
export const slug = (texto) =>
  texto.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
