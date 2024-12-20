import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Use this for relative paths
  build: {
    outDir: 'dist', // Ensure the build output folder is 'dist'
  },
});
