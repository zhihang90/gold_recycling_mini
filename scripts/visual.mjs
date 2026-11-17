/**
 * 视觉回归：按路由 × 视口截图，与基线逐像素对比。
 *
 *   npm run visual:update   # 生成/更新基线（确认当前视觉是期望值后再跑）
 *   npm run visual:check    # 与基线对比，差异超阈值即失败
 *
 * 只覆盖不依赖外链图片的稳定页面；路由表来自构建产物 dist/routes.json，
 * 源头是 src/routes/manifest.ts，这里不再手抄。
 * 基线目录 tests/visual/baseline 需要提交到仓库，换电脑后可直接对比。
 */
import { spawn } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const UPDATE = process.argv.includes('--update')
const PORT = 4318
const BASE = `http://127.0.0.1:${PORT}`
const ROOT = process.cwd()
const BASELINE_DIR = join(ROOT, 'tests/visual/baseline')
const ACTUAL_DIR = join(ROOT, 'tests/visual/actual')
const DIFF_DIR = join(ROOT, 'tests/visual/diff')
const MAX_DIFF_RATIO = 0.002
const ROUTES_FILE = join(ROOT, 'dist/routes.json')

const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '900', width: 900, height: 900 },
]

async function waitForServer(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE)
      if (response.ok) return
    } catch {
      // 服务还没起来，继续等
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(`预览服务在 ${timeoutMs}ms 内没有就绪：${BASE}`)
}

function compare(baselinePath, actualPath, diffPath) {
  const baseline = PNG.sync.read(readFileSync(baselinePath))
  const actual = PNG.sync.read(readFileSync(actualPath))

  if (baseline.width !== actual.width || baseline.height !== actual.height) {
    return { ok: false, reason: `尺寸不一致 ${baseline.width}×${baseline.height} → ${actual.width}×${actual.height}` }
  }

  const diff = new PNG({ width: baseline.width, height: baseline.height })
  const changed = pixelmatch(baseline.data, actual.data, diff.data, baseline.width, baseline.height, {
    threshold: 0.1,
  })
  const ratio = changed / (baseline.width * baseline.height)

  if (ratio > MAX_DIFF_RATIO) {
    writeFileSync(diffPath, PNG.sync.write(diff))
    return { ok: false, reason: `${(ratio * 100).toFixed(2)}% 像素变化` }
  }
  return { ok: true }
}

async function main() {
  if (!existsSync(join(ROOT, 'dist/index.html'))) {
    throw new Error('缺少 dist/index.html，请先执行 npm run build')
  }
  if (!existsSync(ROUTES_FILE)) {
    throw new Error('缺少 dist/routes.json，请先执行 npm run build')
  }

  const ROUTES = JSON.parse(readFileSync(ROUTES_FILE, 'utf8'))

  mkdirSync(BASELINE_DIR, { recursive: true })
  rmSync(ACTUAL_DIR, { recursive: true, force: true })
  rmSync(DIFF_DIR, { recursive: true, force: true })
  mkdirSync(ACTUAL_DIR, { recursive: true })
  mkdirSync(DIFF_DIR, { recursive: true })

  const server = spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'],
    { cwd: ROOT, stdio: 'ignore' },
  )

  let browser
  const failures = []

  try {
    await waitForServer()

    browser = await chromium.launch({ args: ['--no-sandbox'] })

    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()

      for (const route of ROUTES) {
        const file = `${route.name}-${viewport.name}.png`
        const actualPath = join(ACTUAL_DIR, file)
        const baselinePath = join(BASELINE_DIR, file)
        const diffPath = join(DIFF_DIR, file)

        await page.goto(`${BASE}/#${route.path}`, { waitUntil: 'networkidle' })
        await page.evaluate('document.fonts.ready')
        await page.evaluate(async () => {
          await Promise.all(
            Array.from(globalThis.document.images).map((image) =>
              image.complete
                ? Promise.resolve()
                : new Promise((resolve) => {
                    image.addEventListener('load', resolve, { once: true })
                    image.addEventListener('error', resolve, { once: true })
                  }),
            ),
          )
        })
        await page.screenshot({ path: actualPath, animations: 'disabled' })

        if (UPDATE) {
          copyFileSync(actualPath, baselinePath)
          console.log(`更新基线 ${file}`)
          continue
        }

        if (!existsSync(baselinePath)) {
          failures.push(`${file}：缺少基线，先执行 npm run visual:update`)
          continue
        }

        const result = compare(baselinePath, actualPath, diffPath)
        if (result.ok) {
          console.log(`通过 ${file}`)
        } else {
          failures.push(`${file}：${result.reason}`)
        }
      }

      await context.close()
    }
  } finally {
    if (browser) await browser.close()
    server.kill('SIGTERM')
  }

  if (UPDATE) {
    console.log(`\n已更新 ${ROUTES.length * VIEWPORTS.length} 张基线 → tests/visual/baseline`)
    return
  }

  if (failures.length > 0) {
    console.error(`\n视觉回归失败 ${failures.length} 项：\n- ${failures.join('\n- ')}`)
    console.error('\n差异图在 tests/visual/diff，实际截图在 tests/visual/actual。')
    process.exit(1)
  }

  console.log(`\n视觉回归通过：${ROUTES.length * VIEWPORTS.length} 张截图与基线一致。`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
