import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const port = parseInt(env.VITE_PORT || '5173', 10);
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8080';
  const apiUrl = env.VITE_API_URL || '/api';

  return {
    plugins: [react()],
    define: {
      'process.env.VITE_API_URL': JSON.stringify(apiUrl),
      'process.env.REACT_APP_API_URL': JSON.stringify(apiUrl),
      'process.env.API_URL': JSON.stringify(apiUrl)
    },
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
