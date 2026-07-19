import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';

const staticWorker = `const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get('accept')?.includes('text/html');

    if (response.status !== 404 || request.method !== 'GET' || !acceptsHtml) {
      return response;
    }

    const fallbackUrl = new URL('/index.html', request.url);
    return env.ASSETS.fetch(new Request(fallbackUrl, { headers: request.headers }));
  },
};

export default worker;
`;

export function sites(): Plugin {
  return {
    name: 'sites-static-worker',
    apply: 'build',
    async closeBundle() {
      const root = process.cwd();
      const serverDir = path.resolve(root, 'dist/server');
      const metadataDir = path.resolve(root, 'dist/.openai');

      await mkdir(serverDir, { recursive: true });
      await mkdir(metadataDir, { recursive: true });
      await writeFile(path.join(serverDir, 'index.js'), staticWorker, 'utf8');
      await copyFile(
        path.resolve(root, '.openai/hosting.json'),
        path.join(metadataDir, 'hosting.json')
      );
    },
  };
}
