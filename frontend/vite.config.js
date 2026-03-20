import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar Three.js y React Three Fiber en su propio chunk
          // para que el bundle principal (login form, React, Firebase) cargue primero
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // Separar Firebase en otro chunk
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
        }
      }
    }
  }
})
