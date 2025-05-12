import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Using a proper base path for GitHub Pages
  base: './',
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Ensure proper file naming and chunking for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
        // Ensure correct MIME type handling
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // Add these options to help with GitHub Pages deployment
    sourcemap: true,
    // Explicitly set manifest to ensure proper asset loading
    manifest: true,
    // Ensure proper ESM module output
    modulePreload: {
      polyfill: true,
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Fix for crypto module issue
    'process.env': {},
    global: {},
  },
}));
