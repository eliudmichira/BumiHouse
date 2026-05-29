import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react()
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react-is'],
    alias: {
      // Force a single React instance
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(
        __dirname,
        'node_modules/react/jsx-runtime.js'
      )
    }
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws',
      clientPort: 5173
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  },
  build: {
    outDir: 'dist',
    // Empty so JS entry/chunks are not under /assets/; Vite's __vite__mapDeps uses
    // paths like "assets/css/foo.css" resolved relative to the entry module. If the
    // entry lives at /assets/index.js, that becomes /assets/assets/css/foo.css (404/HTML
    // on Firebase SPA rewrites) and dynamic CSS preload fails.
    assetsDir: '',
    sourcemap: false,
    minify: 'terser',
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      external: ['overlapping-marker-spiderfier'],
      output: {
        // Keep hashed JS at dist root so "assets/..." in mapDeps resolves to /assets/...
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        manualChunks: (id) => {
          // Core React ONLY — use precise path matching so react-router-dom,
          // react-leaflet, react-map-gl, @tanstack/react-query etc. do NOT end
          // up in this chunk alongside React core. Mixing them causes circular
          // init issues where React is undefined when a library tries to assign
          // React.Children, producing the runtime TypeError.
          if (
            /\/node_modules\/react\//.test(id) ||
            /\/node_modules\/react-dom\//.test(id) ||
            /\/node_modules\/scheduler\//.test(id)
          ) {
            return 'react-vendor';
          }
          // UI libraries
          if (id.includes('lucide-react') || id.includes('framer-motion')) {
            return 'ui';
          }
          // Maps
          if (id.includes('@react-google-maps') || id.includes('@googlemaps')) {
            return 'maps';
          }
          // Utils
          if (id.includes('axios') || id.includes('@tanstack')) {
            return 'utils';
          }
          // Charts
          if (id.includes('recharts')) {
            return 'charts';
          }
          // Forms
          if (id.includes('react-hook-form')) {
            return 'forms';
          }
          // Large node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(extType)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: {
        safari10: true
      }
    },
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false
  },
  preview: {
    port: 4173,
    host: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['overlapping-marker-spiderfier'],
    // Ensure react is deduped across dependencies
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react-is']
  }
})
