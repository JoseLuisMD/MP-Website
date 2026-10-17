// Enlaces del lateral (los mismos que en https://linktr.ee/mundospixelados).
// `icono` es el nombre de un icono de simple-icons (https://simpleicons.org); `color` cambia el de la marca.
// `grupo`: 'videos' (nuestras redes de vídeo, arriba en «¡Síguenos!») o 'redes' (el resto, bajo «También en...»).
// `tarjeta: true`: no sale en la lista, porque tiene su propia tarjeta en el lateral (Discord.astro).
// Seguidores (se muestran junto a la flecha):
//   `contador`    se piden al construir la web: { youtube: 'ID del canal' }, 'facebook', 'instagram' o 'tiktok'
//                 (claves en los secretos de GitHub; TikTok, en la variable TIKTOK_SEGUIDORES; ver cargarSeguidores() en lib/datos.js)
//   `seguidores`  a mano: el número, que se actualiza editando esta línea
export const REDES = [
  { nombre: 'YouTube', icono: 'siYoutube', grupo: 'videos', contador: { youtube: 'UCLD3BqL4n2GKmitkEQGCoAQ' },
    url: 'https://www.youtube.com/@MundosPixelados/videos' },
  { nombre: 'YouTube Shorts', icono: 'siYoutubeshorts', grupo: 'videos', contador: { youtube: 'UCb3jFYgTbBLjDDOlZiD-2kg' },
    url: 'https://www.youtube.com/@MundosPixeladosShorts/shorts' },
  { nombre: 'Facebook', icono: 'siFacebook', grupo: 'videos', contador: 'facebook',
    url: 'https://www.facebook.com/mundospixeladosoficial/reels' },
  { nombre: 'Instagram', icono: 'siInstagram', grupo: 'videos', contador: 'instagram',
    url: 'https://www.instagram.com/mundospixelados' },
  { nombre: 'TikTok', icono: 'siTiktok', grupo: 'videos', contador: 'tiktok',   // a mano: variable TIKTOK_SEGUIDORES de GitHub
    url: 'https://www.tiktok.com/@mundospixelados_oficial' },
  { nombre: 'X', icono: 'siX', grupo: 'redes', url: 'https://x.com/MundosPixelados' },
  { nombre: 'Bluesky', icono: 'siBluesky', grupo: 'redes', url: 'https://bsky.app/profile/mundospixelados.bsky.social' },
  { nombre: 'Threads', icono: 'siThreads', grupo: 'redes', url: 'https://www.threads.com/@mundospixelados' },
  { nombre: 'Comunidad Discord', icono: 'siDiscord', grupo: 'redes', url: 'https://discord.gg/83xKzSc2Jv', tarjeta: true },
  { nombre: 'Comunidad Steam', icono: 'siSteam', grupo: 'redes', color: '#1b2838', url: 'https://steamcommunity.com/groups/mundospixelados' },
];
