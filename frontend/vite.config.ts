import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:3003; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net http://localhost:3003; frame-src 'self'; font-src 'self' data:;",
    },
  },
});
