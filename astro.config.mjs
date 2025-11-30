// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import Icons from 'unplugin-icons/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://luis-acuna.dev',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss(), Icons({ compiler: 'astro' })],
  }
});