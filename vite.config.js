import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Pupilentes AGO · Vite + React (HashRouter: no requiere rewrites en Vercel)
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  base: './',
  css: { postcss: {} },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom', 'zustand'], gsap: ['gsap', '@gsap/react'] },
      },
    },
  },
});
