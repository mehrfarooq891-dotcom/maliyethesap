import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv, Plugin} from 'vite';

// Plugin to serve .html files when requested without .html extension in dev mode
const cleanUrlsPlugin = (): Plugin => ({
  name: 'clean-urls',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && !req.url.includes('.') && !req.url.endsWith('/')) {
        const urlPath = req.url.split('?')[0];
        const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
        const htmlPath = path.resolve(__dirname, `${urlPath.slice(1)}.html`);
        if (fs.existsSync(htmlPath)) {
          req.url = `${urlPath}.html${query}`;
        }
      }
      next();
    });
  },
});

// Automatically collect all .html files in the root directory for Rollup build
const getHtmlInputs = () => {
  const files = fs.readdirSync(__dirname);
  const inputs: Record<string, string> = {};
  files.forEach((file) => {
    if (file.endsWith('.html')) {
      const key = file.replace('.html', '').replace(/[^a-zA-Z0-9_]/g, '_');
      inputs[key || 'main'] = path.resolve(__dirname, file);
    }
  });
  return inputs;
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), cleanUrlsPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    build: {
      rollupOptions: {
        input: getHtmlInputs(),
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
