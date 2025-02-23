import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), 
    tailwindcss(),],
    theme: {
      extend: {
        fontFamily: {
          garamond: ['EB Garamond', 'serif'],
          inter: ['Inter', 'sans-serif'],
        },
      },
    },
    
})