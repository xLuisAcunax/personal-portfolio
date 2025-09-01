// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import Icons from 'unplugin-icons/vite';
import node from '@astrojs/node';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://ldacuna.netlify.app',
  output: 'server', // Enable server mode for API routes
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    sitemap(),
    react() // Add React for interactive components
  ],
  vite: {
    plugins: [tailwindcss(), Icons({ compiler: 'astro' })],
  }
});