import { defineConfig } from 'vite';


const backendUrl = "http://localhost:3000";//process.env.VITE_BACKEND_URL;

export default defineConfig({
    server: {
        proxy: {
            '/download-audio': {
                target: backendUrl,
                changeOrigin: true,
            },
            '/audio': {
                target: backendUrl,
                changeOrigin: true,
            },
        },
    },
});
