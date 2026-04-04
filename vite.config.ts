import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
