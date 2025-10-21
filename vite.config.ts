import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Vikram-Solar-Falta-EMS/',  // 👈 Add this line here
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
