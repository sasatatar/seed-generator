import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Enable polyfills for crypto and other Node.js modules
      include: ['crypto', 'stream', 'util', 'buffer'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Generate a single HTML file with all assets inlined for offline use
    outDir: 'dist-web',
    assetsInlineLimit: 100000000, // Inline all assets
  },
  base: './', // Use relative paths for offline usage
  worker: {
    format: 'es',
    plugins: () => [
      nodePolyfills({
        include: ['crypto', 'stream', 'util', 'buffer'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
  },
});
