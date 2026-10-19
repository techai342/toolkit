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
      'process.env.IMAGEKIT_PUBLIC_KEY': JSON.stringify(env.IMAGEKIT_PUBLIC_KEY || 'public_8ulBaGE6HasMRTYenvVihqllUm8='),
      'process.env.IMAGEKIT_PRIVATE_KEY': JSON.stringify(env.IMAGEKIT_PRIVATE_KEY || 'private_DBHLVLfKVktC1UhaxnMNjJ++5sc='),
      'process.env.IMAGEKIT_URL_ENDPOINT': JSON.stringify(env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/crv2lglsp'),
      'process.env.CLOUDINARY_CLOUD_NAME': JSON.stringify(env.CLOUDINARY_CLOUD_NAME || 'divloq4oz'),
      'process.env.CLOUDINARY_API_KEY': JSON.stringify(env.CLOUDINARY_API_KEY || '999667235587213'),
      'process.env.CLOUDINARY_API_SECRET': JSON.stringify(env.CLOUDINARY_API_SECRET || 'hKQ5Q6x6bdJOflp14Nk_S-MGrkw'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // Avoiding manual chunks for mission-critical hooks components
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
