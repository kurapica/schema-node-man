// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import legacy from '@vitejs/plugin-legacy'
import copy from 'rollup-plugin-copy'
import path from 'path'

export default defineConfig({
  base: "/schema-node-man/",
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
  ]
  },
  build: {
    rollupOptions: {
      plugins: [
        copy({
          targets: [
            { src: 'src/assets', dest: 'dist' },
          ],
          hook: 'writeBundle',
        }),
      ],
    },
  },
  plugins: [
    vue({
      template:{
        compilerOptions:{
          whitespace: "preserve"
        }
      }
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ],
})
