import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {"name":"GPS Tracker PWA","short_name":"GPSTracker","description":"PWA de mapa GPS con Leaflet, OpenStreetMap, seguimiento en tiempo real, velocímetro y grabación de rutas.","theme_color":"#0ea5e9","background_color":"#0f172a","display":"standalone","start_url":"./","scope":"./","icons":[{"src":"icon.svg","sizes":"any","type":"image/svg+xml","purpose":"any"}]},
    }),
  ],
});
