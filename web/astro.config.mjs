// @ts-check
import { defineConfig } from 'astro/config';

// Em CI/GitHub Pages, defina SITE_URL e BASE_PATH (ver README).
// Localmente o site roda na raiz `/`.
const site = process.env.SITE_URL ?? 'http://localhost:4321';
const base = process.env.BASE_PATH ?? '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
