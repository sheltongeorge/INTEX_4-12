import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003,
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:3003; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://localhost:7156 http://localhost:3003; frame-src 'self'; font-src 'self' data:;",
    },
  },
});
