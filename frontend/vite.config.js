import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ping': 'http://127.0.0.1:8000',
      '/analyze': 'http://127.0.0.1:8000',
      '/build': 'http://127.0.0.1:8000',
      '/assist': 'http://127.0.0.1:8000',
    },
  },
});
