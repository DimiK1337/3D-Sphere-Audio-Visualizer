import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            '/download-audio': {
                target: process.env.VITE_BACKEND_URL,
                changeOrigin: true,
            },
            '/audio': {
                target: process.env.VITE_BACKEND_URL,
                changeOrigin: true,
            },
        },
    },
});
