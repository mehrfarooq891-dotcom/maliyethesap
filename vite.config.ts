import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import fs from 'fs';

// Discover all root html files (index.html, blog.html, blog-*.html)
const htmlFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));
const rollupInputs: Record<string, string> = {};
for (const file of htmlFiles) {
  const name = file.replace(/\.html$/, '');
  rollupInputs[name] = resolve(__dirname, file);
}

const cleanUrlsPlugin = () => ({
  name: 'clean-urls',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url && !req.url.includes('.') && req.url !== '/') {
        const cleanPath = req.url.split('?')[0];
        if (fs.existsSync('.' + cleanPath + '.html')) {
          req.url = cleanPath + '.html' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
        } else if (cleanPath.startsWith('/blog/')) {
          const slug = cleanPath.replace(/^\/blog\//, '');
          const potentialFile = '/blog-' + slug + '.html';
          if (fs.existsSync('.' + potentialFile)) {
            req.url = potentialFile + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
          }
        }
      }
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cleanUrlsPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    rollupOptions: {
      input: rollupInputs,
    },
  },
});

