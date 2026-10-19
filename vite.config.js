import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mediapipe')) {
              return 'mediapipe';
            }
            if (id.includes('jspdf') || id.includes('xlsx')) {
              return 'export-tools';
            }
            if (id.includes('recharts')) {
              return 'recharts';
            }
            if (id.includes('gsap') || id.includes('lenis')) {
              return 'gsap';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            if (id.includes('react') || id.includes('zustand')) {
              return 'vendor';
            }
          }
        },
      },
    },
  },
});
