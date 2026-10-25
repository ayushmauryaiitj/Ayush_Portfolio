import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Tailwind's config is read once per dev-server process here, so a running
// server would otherwise keep serving the old theme (and fail on renamed
// colours) after tailwind.config.js changes. Restart instead.
const restartOnTailwindConfig = (): Plugin => ({
  name: 'restart-on-tailwind-config',
  configureServer(server) {
    server.watcher.on('change', (file) => {
      if (/tailwind\.config\.[cm]?[jt]s$/.test(file)) server.restart();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), restartOnTailwindConfig()],
  server: {
    port: 3000,
    host: true,
    watch: {
      ignored: ['**/scratch/**', '**/scratch_frames/**', '**/assets_source/**', '**/assets_archive/**', '**/*.md'],
    },
  },
});
