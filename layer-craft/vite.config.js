import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8112,
    host: true,
    proxy: {
      // Proxy /api/v1 to sub2api to avoid CORS
      '/proxy-api': {
        target: 'http://localhost:8200',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-api/, '/v1'),
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
