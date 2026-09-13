import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: '/mycalendar-to-drip/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                otro: resolve(__dirname, 'exportInstructions.html'),
            },
        },
    },
});