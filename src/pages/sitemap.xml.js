// Sitemap para Google (https://mundospixelados.es/sitemap.xml). Si se añaden páginas, se añaden aquí.
const PAGINAS = ['/'];

export function GET({ site }) {
  const hoy = new Date().toISOString().slice(0, 10);   // la web se reconstruye cuando hay vídeos o noticias nuevos
  const urls = PAGINAS.map((p) => `  <url><loc>${new URL(p, site)}</loc><lastmod>${hoy}</lastmod></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
