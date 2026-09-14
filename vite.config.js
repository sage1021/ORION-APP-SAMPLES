import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-media',
      closeBundle() {
        const src = path.resolve(__dirname, 'media');
        const dest = path.resolve(__dirname, 'dist', 'media');
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true, force: true });
        }
      }
    }
  ],
  server: {
    port: 5173,
    host: '127.0.0.1'
  }
});
