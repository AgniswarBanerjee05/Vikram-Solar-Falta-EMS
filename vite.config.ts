import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Use base path only for production (GitHub Pages), not for local development
  base: process.env.NODE_ENV === 'production' ? '/Vikram-Solar-Falta-EMS/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
