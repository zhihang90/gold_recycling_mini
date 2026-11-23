import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { SCREENSHOT_ROUTES } from './src/routes/manifest'
import { resolve } from 'node:path'

/**
 * 构建戳：每次构建生成一次，写入 index.html 的 meta 与入口资源 query。
 * 静态托管改不了响应头，只能靠 URL 变化让微信 WebView 重新取 HTML。
 */
const BUILD_STAMP = new Date()
  .toISOString()
  .replace(/[-:TZ.]/g, '')
  .slice(0, 14)

const APP_VERSION = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf8'),
).version

function cacheBustHtml(): Plugin {
  return {
    name: 'cache-bust-html',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html
          .replaceAll('__BUILD_STAMP__', BUILD_STAMP)
          .replaceAll('__APP_VERSION__', APP_VERSION)
          .replace(
            /((?:src|href)=")(\.\/assets\/[^"]+)(")/g,
            (_match, prefix: string, url: string, suffix: string) =>
              `${prefix}${url}?v=${BUILD_STAMP}${suffix}`,
          )
      },
    },
  }
}

/**
 * 把视觉回归路由表随构建产物输出到 dist/routes.json，
 * 让 scripts/visual.mjs 直接消费路由清单，不再手抄一份。
 */
function emitRouteManifest(): Plugin {
  return {
    name: 'emit-route-manifest',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'routes.json',
        source: JSON.stringify(SCREENSHOT_ROUTES, null, 2),
      })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), cacheBustHtml(), emitRouteManifest()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8011,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 显式声明兼容基线，与 package.json 的 browserslist 对齐。
    // 不写会落到 Vite 7 默认的 chrome107/safari16，声明与产物不一致。
    target: ['es2019', 'safari13', 'chrome79'],
    cssTarget: ['safari13', 'chrome79'],
  },
})
