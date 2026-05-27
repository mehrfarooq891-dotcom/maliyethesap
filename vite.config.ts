import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          about: path.resolve(__dirname, 'about.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          blog_istanbul: path.resolve(__dirname, 'blog-istanbul-2026.html'),
          blog_kaba_ince: path.resolve(__dirname, 'blog-kaba-ince-fark.html'),
          blog_100m2: path.resolve(__dirname, 'blog-100m2-maliyet-2026.html'),
          blog_dolar_kuru: path.resolve(__dirname, 'blog-dolar-kuru-etkisi.html'),
          blog_insaat_demiri: path.resolve(__dirname, 'blog-insaat-demiri-fiyatlari-2026.html'),
          blog_cimento: path.resolve(__dirname, 'blog-cimento-fiyatlari-2026.html'),
          blog_insaat_maliyeti: path.resolve(__dirname, 'blog-insaat-maliyeti-hesaplama.html'),
          blog_luks_ekonomik: path.resolve(__dirname, 'blog-luks-ekonomik-insaat-farki.html'),
          blog_ankara: path.resolve(__dirname, 'blog-ankara-2026.html'),
          blog_izmir: path.resolve(__dirname, 'blog-izmir-2026.html'),
          blog_muteahhit: path.resolve(__dirname, 'blog-muteahhit-mi-kendim-mi.html'),
          blog_ruhsat: path.resolve(__dirname, 'blog-insaat-ruhsati-maliyeti-2026.html'),
          blog_zemin: path.resolve(__dirname, 'blog-zemin-etudu-maliyeti.html'),
          blog_yalitimi: path.resolve(__dirname, 'blog-isi-yalitimi-maliyeti-2026.html'),
          blog: path.resolve(__dirname, 'blog.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
