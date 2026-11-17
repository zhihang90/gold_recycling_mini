/**
 * barrelify.mjs — 把文件中分散的 `import { X } from '@/components/X'`
 * 合并成 `import { X, Y, type T } from '@/components'` barrel 写法。
 *
 * 只处理 src/ 下的 .ts/.tsx 文件，跳过 scripts/。
 * 命令：node scripts/barrelify.mjs [--dry-run]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const DRY = process.argv.includes('--dry-run')
const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

/** 递归列文件 */
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name)
    if (e.isDirectory()) return walk(full)
    return /\.(tsx?)$/.test(e.name) ? [full] : []
  })
}

/**
 * 解析 import 语句，返回 { names: string[], isType: boolean }[]
 * 只捕获 `import { X } from '@/components/...'` 和
 *        `import type { X } from '@/components/...'`
 */
const IMPORT_RE =
  /^import\s+(type\s+)?\{([^}]+)\}\s+from\s+['"]@\/components\/[^'"]+['"]\s*;?\s*$/gm

function collectImports(src) {
  const matches = []
  let m
  while ((m = IMPORT_RE.exec(src)) !== null) {
    const isType = !!m[1]
    // 解析 { A, B as C, type T } 里的名字
    const body = m[2]
    const parts = body.split(',').map((s) => s.trim()).filter(Boolean)
    for (const p of parts) {
      // 处理 `type Foo` / `Bar as Baz` 语法
      const typePrefix = p.startsWith('type ')
      const clean = p.replace(/^type\s+/, '').trim()
      // 如果有 `as`，保留完整原名（barrel 导出的是原名）
      const localName = clean.includes(' as ') ? clean.split(/\s+as\s+/)[0].trim() : clean
      matches.push({ localName, isType: isType || typePrefix, raw: p })
    }
  }
  return matches
}

function transformFile(file) {
  const content = readFileSync(file, 'utf8')
  const imports = collectImports(content)
  if (imports.length === 0) return null

  // 去重（同一个 name 可能在两条 import 里；type 优先保留 type）
  const seen = new Map()
  for (const imp of imports) {
    if (!seen.has(imp.localName)) {
      seen.set(imp.localName, imp)
    }
  }
  const unique = [...seen.values()]
  const valueImports = unique.filter((i) => !i.isType).map((i) => i.localName)
  const typeImports = unique.filter((i) => i.isType).map((i) => i.localName)

  // 构造替换的 barrel import 行
  const newLines = []
  if (valueImports.length > 0) newLines.push(`import { ${valueImports.join(', ')} } from '@/components'`)
  if (typeImports.length > 0) newLines.push(`import type { ${typeImports.join(', ')} } from '@/components'`)
  const replacement = newLines.join('\n')

  // 删掉所有原来的深路径 import 行
  const stripped = content.replace(IMPORT_RE, '').replace(/^\s*$/gm, '')

  // 找到第一个 import 位置，把 barrel 插进去
  const firstImportIdx = stripped.indexOf('import ')
  if (firstImportIdx === -1) return null
  const before = stripped.slice(0, firstImportIdx)
  const after = stripped.slice(firstImportIdx)

  const newContent = (before + replacement + '\n' + after).replace(/\n{3,}/g, '\n\n')
  return { content: newContent, count: imports.length }
}

const allFiles = walk(SRC).filter(
  (f) => !f.includes('/scripts/') && !f.includes('/node_modules/'),
)

let totalReplaced = 0
let totalFiles = 0

for (const file of allFiles) {
  const result = transformFile(file)
  if (!result) continue
  totalFiles++
  totalReplaced += result.count
  const rel = relative(ROOT, file)
  if (DRY) {
    console.log(`[dry-run] ${rel} — ${result.count} imports → barrel`)
  } else {
    writeFileSync(file, result.content, 'utf8')
    console.log(`${rel} — ${result.count} imports consolidated`)
  }
}

console.log(`\n${DRY ? '[dry-run] ' : ''}Done: ${totalFiles} files, ${totalReplaced} imports merged into barrel.`)
