# MP-Website

Web de Mundos Pixelados: los últimos vídeos y shorts de los canales, enlaces a las redes y las últimas
noticias que publica el bot. Hecha con [Astro](https://astro.build) y publicada en GitHub Pages.

## Cómo se actualiza

El workflow `.github/workflows/web.yml` se ejecuta en cada `push` a `main` y cuando se lanza desde fuera (`workflow_dispatch`):

1. `npm run videos` lee el RSS de los canales de YouTube y añade los vídeos nuevos a `src/data/videos.json`
   (el RSS solo trae los 15 últimos, así que este JSON guarda el historial). Si hay cambios, los sube al repo.
2. `npm run build` construye la web. Las noticias se descargan en ese momento de `noticias_web.json`
   en el repo [MP-YT-Discord](https://github.com/JoseLuisMD/MP-YT-Discord) (rama `estado`), donde el bot las guarda al publicarlas.
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
npm ci           # instala las dependencias (las versiones fijadas en package-lock.json)
npm run videos   # descarga los vídeos
npm run dev      # http://localhost:4321/
```

Para actualizar las dependencias: `npm update`, comprobar que `npm run build` funciona y subir el `package-lock.json`.

## Dominio

La web está en https://mundospixelados.es (registrado en DonDominio). Los DNS apuntan a GitHub Pages:
4 registros `A` y 4 `AAAA` con las IPs de GitHub para el dominio raíz y un `CNAME` de `www` a `joseluismd.github.io`.
El dominio está configurado en Settings → Pages → Custom domain y `site` en `astro.config.mjs`.
