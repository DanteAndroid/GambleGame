import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'prune-dist-unreferenced-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          if (!fs.existsSync(distDir)) return;

          // Prune legacy un-subsetted fonts so only *-subset.woff2 ship to CDN
          const distFontsDir = path.join(distDir, 'fonts');
          if (fs.existsSync(distFontsDir)) {
            for (const entry of fs.readdirSync(distFontsDir)) {
              if (!entry.endsWith('-subset.woff2')) {
                fs.rmSync(path.join(distFontsDir, entry), { force: true, recursive: true });
              }
            }
          }

          // Prune raw unoptimized originals replaced by /assets/opt/{thumb,display}/*.webp
          const distAssetsDir = path.join(distDir, 'assets');
          if (fs.existsSync(path.join(distAssetsDir, 'opt'))) {
            for (const legacyDir of ['manga', 'aistudio']) {
              const target = path.join(distAssetsDir, legacyDir);
              if (fs.existsSync(target)) {
                fs.rmSync(target, { force: true, recursive: true });
              }
            }
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
