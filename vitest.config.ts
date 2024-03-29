import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        include: ['tests/*.*'],
        environment: 'jsdom',
    },
    resolve: {
        alias: [{ find: "@", replacement: resolve(__dirname, "./") }]
    }
})