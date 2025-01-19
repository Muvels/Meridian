import { resolve } from 'path';

import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve(__dirname, 'src/renderer/src'),
        src: resolve(__dirname, 'src/renderer/src')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve(__dirname, 'src/renderer/src'),
        src: resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', { target: '18' }]]
        }
      })
    ],
    css: {
      postcss: {
        plugins: [tailwindcss()]
      }
    }
  }
});
