// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import legacy from '@vitejs/plugin-legacy'
import copy from 'rollup-plugin-copy'
import path from 'path'

const getRealPath = (pkgName: string) => {
  return path.resolve('node_modules', pkgName);
}

export default defineConfig({
  base: "./",
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: /^schema-node(\/.*)?$/,
        replacement: getRealPath('schema-node') + '$1'
      },
      {
        find: /^schema-node-vue-view(\/.*)?$/,
        replacement: getRealPath('schema-node-vue-view') + '$1'
      }
  ]
  },
  optimizeDeps: {
    exclude: ['schema-node', 'schema-node-vue-view'],
  },
  server: {
    watch: {
      ignored: [
        '!**/node_modules/schema-node/**',
        '!**/node_modules/schema-node-vue-view/**'
      ],
    }
  },
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
