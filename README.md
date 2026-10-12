# MP-Website

Web de Mundos Pixelados: los últimos vídeos y shorts de los canales, enlaces a las redes y las últimas
noticias que publica el bot. Hecha con [Astro](https://astro.build) y publicada en GitHub Pages.

## Cómo se actualiza

El workflow `.github/workflows/web.yml` se ejecuta en cada `push` a `main` y cuando se lanza desde fuera (`workflow_dispatch`):

1. `npm run videos` lee el RSS de los canales de YouTube y añade los vídeos nuevos a `src/data/videos.json`
   (el RSS solo trae los 15 últimos, así que este JSON guarda el historial). Si hay cambios, los sube al repo.
2. `npm run build` construye la web. Las noticias se descargan en ese momento de `noticias_web.json`
   en el repo [MP-YT-Discord](https://github.com/JoseLuisMD/MP-YT-Discord), donde el bot las guarda al publicarlas.
3. La web se publica en GitHub Pages.

No hay base de datos: los datos son archivos JSON en los repositorios.

## Estructura

```
src/
  data/canales.js       canales de YouTube que salen en la web
  data/redes.js         enlaces de la sección «Enlaces» (solo salen los que tienen url)
  data/videos.json      vídeos guardados (lo actualiza el workflow)
  lib/datos.js          carga de vídeos y noticias, miniaturas y fechas
  components/           cabecera, tarjetas de vídeo y short, enlaces y noticias
  pages/index.astro     página principal
  styles/global.css     colores y estilos
scripts/actualizar-videos.mjs
```

## Ejecutar en local

Hace falta [Node.js](https://nodejs.org) 22 o superior.

```bash
npm install
npm run videos   # descarga los vídeos
npm run dev      # http://localhost:4321/MP-Website/
```

## Dominio propio

En `astro.config.mjs`, cambia `site` por el dominio y quita `base`. Después, en GitHub:
Settings → Pages → Custom domain.
