import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import fs from 'fs';
import path from 'path';

// GitHub Pages SPA fallback: copy index.html -> 404.html so deep links
// (e.g. /qingyu-garden/insight) and hard refreshes serve the app instead
// of GitHub's default 404 page.
function spaFallback() {
  return {
    name: 'spa-fallback-404',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist');
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
  base: '/qingyu-garden/',
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths(),
    spaFallback(),
  ],
})
