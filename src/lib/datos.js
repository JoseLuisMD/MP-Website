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

// Comunidad de Discord: miembros y conectados a partir del enlace de invitación (API pública de Discord, sin clave).
// Se piden al construir la web y el navegador los vuelve a pedir al cargar la página (Discord lo permite).
export const discordInvitacion = (url) => url.split('/').filter(Boolean).pop();

export async function cargarDiscord(codigo) {
  try {
    const r = await fetch(`https://discord.com/api/v10/invites/${codigo}?with_counts=true`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    if (!Number.isFinite(d.approximate_member_count)) throw new Error('respuesta inesperada');
    return { miembros: d.approximate_member_count, conectados: d.approximate_presence_count ?? 0 };
  } catch (e) {
    console.warn(`No se pudieron cargar los datos de Discord: ${e.message}`);
    return null;
  }
}

// Seguidores de las redes con `contador` en redes.js. Se piden al construir la web con las claves de los secretos de
// GitHub (variables de entorno del workflow); si falta una clave o falla una API, esa red se queda sin cifra.
//   YOUTUBE_API_KEY          clave de la API de YouTube (Google Cloud)
//   META_TOKEN               token de la página de Facebook (Graph API), sin caducidad
//   FACEBOOK_PAGE_ID         ID de la página de Facebook
//   INSTAGRAM_ID             ID de la cuenta profesional de Instagram vinculada a la página
//   TIKTOK_SEGUIDORES        (variable, no secreto) seguidores de TikTok, puestos a mano
async function pedirJson(url, nombre, cabeceras = {}) {
  try {
    const r = await fetch(url, { headers: cabeceras });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.warn(`No se pudieron cargar los seguidores de ${nombre}: ${e.message}`);
    return null;
  }
}

export async function cargarSeguidores(redes) {
  const env = process.env;
  const seguidores = {};   // { nombre de la red: número }
  const canales = redes.filter((r) => r.contador?.youtube);
  if (env.YOUTUBE_API_KEY && canales.length) {
    const ids = canales.map((r) => r.contador.youtube).join(',');
    const d = await pedirJson(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${ids}&key=${env.YOUTUBE_API_KEY}`, 'YouTube');
    for (const canal of d?.items ?? []) {
      const red = canales.find((r) => r.contador.youtube === canal.id);
      const n = Number(canal.statistics?.subscriberCount);
      if (red && !canal.statistics?.hiddenSubscriberCount && Number.isFinite(n)) seguidores[red.nombre] = n;
    }
  }
  const meta = { facebook: env.FACEBOOK_PAGE_ID, instagram: env.INSTAGRAM_ID };
  for (const red of redes.filter((r) => r.contador === 'facebook' || r.contador === 'instagram')) {
    const id = meta[red.contador];
    if (!env.META_TOKEN || !id) continue;
    const d = await pedirJson(`https://graph.facebook.com/${id}?fields=followers_count`, red.nombre,
      { Authorization: `Bearer ${env.META_TOKEN}` });
    if (Number.isFinite(d?.followers_count)) seguidores[red.nombre] = d.followers_count;
  }
  // TikTok no tiene API sencilla: el número se pone a mano en la variable TIKTOK_SEGUIDORES de GitHub
  const tiktok = Number(env.TIKTOK_SEGUIDORES);
  for (const red of redes.filter((r) => r.contador === 'tiktok')) {
    if (env.TIKTOK_SEGUIDORES && Number.isFinite(tiktok)) seguidores[red.nombre] = tiktok;
  }
  return seguidores;
}

// 3.210 → «3,2 mil»; 1.250.000 → «1,3 M»
const FORMATO_COMPACTO = new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 });
export const cifraCorta = (n) => FORMATO_COMPACTO.format(n);
