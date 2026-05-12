import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LumoPlay',
      formats: ['es', 'umd'],
      fileName: (format: string) => {
        return 'lumoplay.js';
      }
    },
    rollupOptions: {
      output: {
        globals: {}
      }
    },
    outDir: 'build',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
