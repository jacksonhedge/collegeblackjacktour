import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/', // Using root path, not a subdirectory
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  server: {
    port: 3001,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
    historyApiFallback: true,
  },
  preview: {
    port: 3000
  },
  build: {
    outDir: 'dist', // Make sure this matches what server.js is serving
    sourcemap: false, // Disable source maps to avoid issues with lucide-react
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  publicDir: path.resolve(__dirname, 'public')
});
