import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Lokal ishlaganda /backend so'rovlari haqiqiy hostingga yo'naltiriladi
  const backend = env.VITE_BACKEND_ORIGIN || 'https://6a70174330801.xvest4.ru/23maktab'
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/backend': { target: backend, changeOrigin: true, secure: true, rewrite: (p: string) => p.replace(/^\/backend/, '') },
      },
    },
  }
})
