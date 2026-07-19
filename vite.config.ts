import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';
import { sites } from './build/sites-vite-plugin';

const isSitesBuild = process.env.SITES_BUILD === 'true';

// GitHub Pages SPA fallback: copy index.html -> 404.html so deep links
// (e.g. /qingyu-garden/insight) and hard refreshes serve the app instead
// of GitHub's default 404 page.
function spaFallback(outDirName = 'dist') {
  return {
    name: 'spa-fallback-404',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), outDirName);
      const index = path.join(outDir, 'index.html');
      const fallback = path.join(outDir, '404.html');
      if (fs.existsSync(index)) {
        fs.copyFileSync(index, fallback);
        console.log('[spa-fallback] copied index.html -> 404.html');
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: isSitesBuild ? '/' : '/qingyu-garden/',
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  build: {
    outDir: isSitesBuild ? 'dist/client' : 'dist',
    sourcemap: isSitesBuild ? false : 'hidden',
  },
  plugins: [
    react(),
    spaFallback(isSitesBuild ? 'dist/client' : 'dist'),
    ...(isSitesBuild ? [sites()] : []),
  ],
})
