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
        'img-src * data: blob:; ' +
        'connect-src * ws: wss:; ' + // Add WebSocket support
        "frame-src 'self'; " +
        "font-src 'self' data:;",
    },
    // Simplified HMR configuration for more reliable connections
    hmr: {
      // Don't specify protocol to let Vite choose based on server configuration
      clientPort: 3003,
      // Try to reconnect if connection is lost
      timeout: 120000,
      overlay: true,
    },
    // Add CORS headers
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
    // Add middleware to handle WebSocket issues
    middlewareMode: false,
  },
});
