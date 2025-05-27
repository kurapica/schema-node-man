// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import legacy from '@vitejs/plugin-legacy'
import copy from 'rollup-plugin-copy'

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      plugins: [
        copy({
          targets: [
            { src: 'src/assets', dest: 'dist' }, // 将 src/assets 复制到 dist/assets
          ],
          hook: 'writeBundle', // 在打包完成后复制文件
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
