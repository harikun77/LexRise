import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When deploying to GitHub Pages the app is served from a sub-path:
//   https://<user>.github.io/<repo>/
//
// The GitHub Actions workflow sets VITE_BASE_PATH=/<repo>/ at build time.
// For local dev (npm run dev) the variable is unset so it falls back to '/'.
//
// If you ever use a custom domain (e.g. lexrise.app) set VITE_BASE_PATH=/
// in the workflow and the app will serve from the root.

const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  plugins: [react()],
  base,
  define: {
    // Inject the base path into the service worker at build time.
    // public/sw.js references __BASE_PATH__ so it caches the correct URLs.
    __BASE_PATH__: JSON.stringify(base),
  },
})
