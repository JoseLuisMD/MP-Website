// Lee el feed RSS de cada canal de YouTube y añade a src/data/videos.json los vídeos que aún no estén.
// El feed solo trae los 15 últimos de cada canal, así que el JSON es el que guarda el historial.
// Lo ejecuta GitHub Actions antes de construir la web (y se puede lanzar a mano con `npm run videos`).
import { readFile, writeFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';
import { CANALES, MAX_VIDEOS } from '../src/data/canales.js';

const ARCHIVO = new URL('../src/data/videos.json', import.meta.url);
const FEED = 'https://www.youtube.com/feeds/videos.xml?channel_id=';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', htmlEntities: true });

async function leerFeed(canal) {
  const r = await fetch(FEED + canal.id);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const feed = parser.parse(await r.text()).feed ?? {};
  const entradas = [].concat(feed.entry ?? []);
  return entradas.map((e) => {
    const enlace = [].concat(e.link)[0]?.href ?? '';
    return {
      id: e['yt:videoId'],
      titulo: String(e.title),
      fecha: e.published,
      short: enlace.includes('/shorts/'),
      canal: canal.nombre,
    };
  });
}

const guardados = JSON.parse(await readFile(ARCHIVO, 'utf-8'));
const porId = new Map(guardados.map((v) => [v.id, v]));
let nuevos = 0;

for (const canal of CANALES) {
  try {
    for (const v of await leerFeed(canal)) {
      if (!v.id) continue;
      if (!porId.has(v.id)) nuevos++;
      porId.set(v.id, v); // se actualiza por si ha cambiado el título
    }
  } catch (e) {
    console.log(`No se pudo leer el feed de ${canal.nombre}: ${e.message}`);
  }
}

const videos = [...porId.values()]
  .sort((a, b) => b.fecha.localeCompare(a.fecha))
  .slice(0, MAX_VIDEOS);
await writeFile(ARCHIVO, JSON.stringify(videos, null, 2) + '\n');
console.log(`Vídeos nuevos: ${nuevos} (total: ${videos.length})`);
