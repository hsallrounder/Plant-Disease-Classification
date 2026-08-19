import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const port = parseInt(env.VITE_PORT || '5173', 10);
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8080';

  return {
    plugins: [react()],
    server: {
      port: port,
      host: true,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
