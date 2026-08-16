import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Served from https://welcomedrain.github.io/Smart-Photo-Resizer/, so every
// asset URL has to be prefixed with the repository name.
export default defineConfig({
  base: '/Smart-Photo-Resizer/',
  plugins: [react(), tailwindcss()],
});
