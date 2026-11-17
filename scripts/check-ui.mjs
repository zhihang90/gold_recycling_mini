/**
 * UI 一致性守卫：把「禁止任意值 / 禁止裸色值」从文档约定变成构建前检查。
 * 只做静态文本检查，不替代 tsc / eslint；命中后由页面改用 tokens.css 的语义类。
 * 例外：同一行加 // ui-allow 可跳过（仅限确实无法用 token 表达的场景）。
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')
const FILE = /\.(tsx|ts)$/

const RULES = [
  {
    id: 'raw-hex',
    test: (line) => /#[0-9a-fA-F]{3,8}\b/.test(line),
    message: '禁止裸 hex 颜色，改用 tokens.css 的语义类（如 bg-primary / text-price）',
  },
  {
    id: 'arbitrary-color',
    test: (line) => /\b(?:bg|text|border|ring|fill|stroke)-\[(?:#|rgb|hsl)/.test(line),
    message: '禁止任意色值，改用语义色类',
  },
  {
    id: 'arbitrary-font-size',
    test: (line) => /\btext-\[\d+(?:\.\d+)?(?:px|rem|em)\]/.test(line),
    message: '禁止任意字号，改用 text-section / text-body / text-caption 等角色类',
  },
  {
    id: 'arbitrary-radius-shadow',
    test: (line) => /\b(?:rounded|shadow)-\[/.test(line),
    message: '禁止任意圆角/阴影，改用 token 阶梯（rounded-md / shadow-xs）',
  },
  {
    id: 'native-img',
    test: (line, file) =>
      !file.includes('/style-guide/') && file.startsWith('src/pages/') && /<img\b/.test(line),
    message: '页面禁止裸 <img>，改用 MediaVisual 以统一加载、兜底与裁切',
  },
]

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return FILE.test(entry.name) ? [full] : []
  })
}

const errors = []

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file)
  const lines = readFileSync(file, 'utf8').split('\n')
  const allowFile = lines.slice(0, 5).some((line) => line.includes('ui-allow-file'))
  if (allowFile) continue

  lines.forEach((line, index) => {
    if (line.includes('ui-allow')) return
    for (const rule of RULES) {
      if (rule.test(line, rel)) {
        errors.push(`${rel}:${index + 1} [${rule.id}] ${rule.message}\n    ${line.trim()}`)
      }
    }
  })
}

if (errors.length > 0) {
  console.error(`UI 检查未通过，共 ${errors.length} 处：\n`)
  console.error(errors.join('\n\n'))
  console.error('\n修复方式见 AGENTS.md「设计约束」；确需例外时在该行加 // ui-allow。')
  process.exit(1)
}

console.log('UI 检查通过：无裸色值、任意字号、任意圆角/阴影与页面裸 img。')
