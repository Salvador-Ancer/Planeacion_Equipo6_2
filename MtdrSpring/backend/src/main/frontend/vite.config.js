import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/auth':      { target: 'http://localhost:8080', changeOrigin: true },
      '/proyectos': { target: 'http://localhost:8080', changeOrigin: true },
      '/tareas':    { target: 'http://localhost:8080', changeOrigin: true },
      '/sprints':   { target: 'http://localhost:8080', changeOrigin: true },
      '/kpis':      { target: 'http://localhost:8080', changeOrigin: true },
      '/usuarios':  { target: 'http://localhost:8080', changeOrigin: true },
      '/ai':        { target: 'http://localhost:8080', changeOrigin: true },
      '/rag':       { target: 'http://localhost:8080', changeOrigin: true },
    }
  }
})