import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost.pem')),
    },
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://localhost:3003; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src * data: blob:; " +
        "connect-src *; " +
        "frame-src 'self'; " +
        "font-src 'self' data:;",
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:3003; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net http://localhost:3003; frame-src 'self'; font-src 'self' data:;",
      'Access-Control-Allow-Origin': '*'
    },
  },
});
