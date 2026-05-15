import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/app-api': {
        target: 'http://localhost:48080',
        changeOrigin: true,
      },
      '/admin-api': {
        target: 'http://localhost:48080',
        changeOrigin: true,
      },
      // ── 管理系统反向代理：统一端口入口 ──
      '/admin': {
        target: 'http://localhost:8181',
        changeOrigin: true,
        ws: true, // 代理 WebSocket（Vite HMR）
      },
    },
  },
})
