/**
 * 路由清单强校验：manifest.ts 与 pages/ 目录、paths.ts 的双向契约。
 * 命中后修改 manifest 或页面文件名；不要用 ui-allow 例外机制——路由是硬约束，错了就得改。
 *
 * 检查项：
 *   1. manifest 每条 page 字段 → src/pages/<page>.tsx 文件必须存在
 *   2. src/pages/ 下每个 .tsx 文件 → 必须出现在 manifest（或显式豁免：shared / 内部组件）
 *   3. manifest 所有 id 唯一
 *   4. manifest 所有 path 唯一
 *   5. 带 tab 的路由 → tab.icon 必须是允许值（home/bag/cart/orders/user）
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const PAGES = join(ROOT, 'src', 'pages')
const MANIFEST = join(ROOT, 'src', 'routes', 'manifest.ts')

/** 不参与路由注册的页面文件（内部组件 / style-guide 共享模块） */
const PAGE_EXEMPT = new Set(['style-guide/shared'])

const ALLOWED_TAB_ICONS = new Set(['home', 'bag', 'cart', 'orders', 'user'])

/** 递归列出 pages/ 下全部 .tsx 相对路径（正斜杠、不带扩展名） */
function walkPages(dir, base = '') {
  const entries = readdirSync(dir, { withFileTypes: true })
  const out = []
  for (const e of entries) {
    const full = join(dir, e.name)
    const rel = base ? `${base}/${e.name}` : e.name
    if (e.isDirectory()) out.push(...walkPages(full, rel))
    else if (e.name.endsWith('.tsx')) out.push(rel.replace(/\.tsx$/, ''))
  }
  return out
}

function readManifest() {
  const src = readFileSync(MANIFEST, 'utf8')
  // 简单正则提取每条路由对象（比完整 parser 更稳健、不会因为字段顺序或注释崩）
  // 匹配 { id: 'xxx', ... page: 'Yyy' ... } 结构
  const routeBlockRe = /\{\s*id:\s*['"]([^'"]+)['"][\s\S]*?\n\s*\}/g
  const routes = []
  let m
  while ((m = routeBlockRe.exec(src)) !== null) {
    const block = m[0]
    const id = m[1]
    const pathMatch = block.match(/path:\s*paths\.([\w.]+)/) || block.match(/path:\s*['"]([^'"]+)['"]/)
    const path = pathMatch ? (pathMatch[2] ?? pathMatch[1]) : null
    const pageMatch = block.match(/page:\s*['"]([^'"]+)['"]/)
    const page = pageMatch ? pageMatch[1] : null
    const tabMatch = block.match(/tab:\s*\{[\s\S]*?icon:\s*['"]([^'"]+)['"]/)
    const tabIcon = tabMatch ? tabMatch[1] : null
    const labelMatch = block.match(/label:\s*['"]([^'"]+)['"]/)
    routes.push({ id, path, page, tabIcon, label: labelMatch?.[1] ?? '' })
  }
  return routes
}

const errors = []

// ---- 1. 读 manifest ----
const manifestRoutes = readManifest()
if (manifestRoutes.length === 0) {
  errors.push('未能从 manifest.ts 解析到任何路由条目——脚本可能需要更新匹配规则')
}

// ---- 2. page 字段 → 文件必须存在 ----
for (const r of manifestRoutes) {
  if (!r.page) {
    errors.push(`manifest 路由 id="${r.id}" 缺少 page 字段`)
    continue
  }
  const file = join(PAGES, `${r.page}.tsx`)
  try {
    statSync(file)
  } catch {
    errors.push(`manifest 路由 id="${r.id}" 引用 src/pages/${r.page}.tsx，但文件不存在`)
  }
}

// ---- 3. pages/ 下文件必须在 manifest（或豁免） ----
const allPageFiles = new Set(walkPages(PAGES))
const manifestPages = new Set(manifestRoutes.map((r) => r.page).filter(Boolean))
for (const file of allPageFiles) {
  if (manifestPages.has(file)) continue
  if (PAGE_EXEMPT.has(file)) continue
  errors.push(
    `src/pages/${file}.tsx 未在 manifest.ts 注册——要么加一条路由，要么加入 PAGE_EXEMPT（如果是内部组件）`,
  )
}

// ---- 4. id 唯一 ----
const ids = manifestRoutes.map((r) => r.id)
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i)
for (const id of [...new Set(dupIds)]) {
  errors.push(`manifest 存在重复 id="${id}"`)
}

// ---- 5. path 唯一 ----
const paths = manifestRoutes.map((r) => r.path).filter(Boolean)
const dupPaths = paths.filter((p, i) => paths.indexOf(p) !== i)
for (const p of [...new Set(dupPaths)]) {
  errors.push(`manifest 存在重复 path="${p}"`)
}

// ---- 6. tab.icon 白名单 ----
for (const r of manifestRoutes) {
  if (r.tabIcon && !ALLOWED_TAB_ICONS.has(r.tabIcon)) {
    errors.push(
      `manifest 路由 id="${r.id}" 的 tab.icon="${r.tabIcon}" 不在允许列表 [${[...ALLOWED_TAB_ICONS].join(', ')}]`,
    )
  }
}

if (errors.length > 0) {
  console.error(`\n路由清单校验未通过，共 ${errors.length} 处：\n`)
  errors.forEach((e, i) => console.error(`  ${i + 1}. ${e}`))
  console.error(
    '\n修复方式：路由 id / path / page 是硬约束，错了就得改——没有 ui-allow 例外。',
  )
  console.error(
    '如果新增了 src/pages/ 下的内部组件文件（不是路由页），请把它加入 scripts/check-routes.mjs 的 PAGE_EXEMPT 集合。',
  )
  process.exit(1)
}

console.log(`路由清单校验通过：${manifestRoutes.length} 条 manifest 条目 ↔ ${allPageFiles.size} 个页面文件，id/path 唯一，tab 图标合规。`)
