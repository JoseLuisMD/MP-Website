import { defineConfig } from 'astro/config';

// Mientras no haya dominio propio, la web vive en joseluismd.github.io/MP-Website.
// Con dominio: site: 'https://mundospixelados.es' y se quita `base`.
export default defineConfig({
  site: 'https://joseluismd.github.io',
  base: '/MP-Website/',
});
