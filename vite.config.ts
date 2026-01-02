import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        app: './index.html'
      }
    }
  },
  server: {
    port: 4003,
    open: true
  }
});
