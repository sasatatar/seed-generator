import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Enable polyfills for crypto and other Node.js modules
      include: ['crypto', 'stream', 'util', 'buffer', 'vm'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-web',
  },
  base: './', // Use relative paths for offline usage
});
