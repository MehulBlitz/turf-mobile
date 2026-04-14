import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'lucide-react': path.resolve(__dirname, 'src/lib/lucide-untitled.jsx'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      target: ['es2020'],
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-core': ['react', 'react-dom'],
            'motion': ['motion/react'],
            'untitled-icons': ['@untitledui/icons'],
            'supabase': ['@supabase/supabase-js'],
          },
          // Optimize chunk file names for better caching
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      chunkSizeWarningLimit: 600, // Increase warning limit after optimization
      sourcemap: false, // Disable sourcemaps in production for smaller bundle
      cssCodeSplit: true,
    },
  };
});
