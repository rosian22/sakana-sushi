import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The /api proxy is only used by `npm run dev` outside Docker;
// in the container nginx does the proxying instead.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
