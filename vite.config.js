import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const path = require('path')
const fs = require('fs')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    https: {
      cert: fs.readFileSync(path.join(__dirname, 'src/ssl/win.pem')),
      key: fs.readFileSync(path.join(__dirname, 'src/ssl/win-key.pem'))
    }
  }
})
