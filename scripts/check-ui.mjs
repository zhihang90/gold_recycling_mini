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
  {
    id: 'gold-solid',
    test: (line, file) =>
      !file.startsWith('src/pages/style-guide/') && /\bbg-gold-(?:800|900)\b/.test(line),
    message: '金色不作实底：按钮改 bg-primary，选中/浅底改 bg-primary-soft',
  },
  {
    id: 'local-status-tone',
    test: (line, file) =>
      file.startsWith('src/pages/') && /\bconst\s+\w*STATUS_TONE\b/.test(line),
    message: '状态色映射只放 src/mocks，页面统一用 ORDER_STATUS_TONE_CLASS + 状态 tone',
  },
]

/** Button 标签内部禁止覆写形态：按钮圆角与配色只由 Button / buttonStyles 决定。 */
const BUTTON_RULES = [
  {
    id: 'button-radius',
    test: (tag) => /\brounded-full\b/.test(tag),
    message: 'Button 禁止覆写 rounded-full，按钮形态统一为 rounded-md',
  },
  {
    id: 'button-gold',
    test: (tag) => /\bbg-gold-\d+\b/.test(tag),
    message: 'Button 禁止金色实底，改用 primary（默认）或 secondary',
  },
]

/**
 * 扫描 `<Button ...>` 起始标签文本（含跨行属性），返回 [起始下标, 结束下标)。
 * 用字符级状态机跳过引号与 `{}` 表达式，避免被 onClick 中的 `=>` 提前截断。
 */
function scanButtonTags(text) {
  const tags = []
  let index = 0
  while ((index = text.indexOf('<Button', index)) !== -1) {
    let end = index + 7
    let quote = null
    let depth = 0
    for (; end < text.length; end += 1) {
      const char = text[end]
      if (quote) {
        if (char === quote) quote = null
        continue
      }
      if (char === '"' || char === "'" || char === '`') {
        quote = char
        continue
      }
      if (char === '{') depth += 1
      else if (char === '}') depth -= 1
      else if (char === '>' && depth === 0) {
        end += 1
        break
      }
    }
    tags.push([index, end])
    index = end
  }
  return tags
}

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
  const source = readFileSync(file, 'utf8')
  const lines = source.split('\n')
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

  for (const [start, end] of scanButtonTags(source)) {
    const tag = source.slice(start, end)
    if (tag.split('\n').some((line) => line.includes('ui-allow'))) continue
    const line = source.slice(0, start).split('\n').length
    for (const rule of BUTTON_RULES) {
      if (rule.test(tag)) {
        errors.push(`${rel}:${line} [${rule.id}] ${rule.message}\n    ${tag.split('\n')[0].trim()}`)
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`UI 检查未通过，共 ${errors.length} 处：\n`)
  console.error(errors.join('\n\n'))
  console.error('\n修复方式见 AGENTS.md「设计约束」；确需例外时在该行加 // ui-allow。')
  process.exit(1)
}

console.log(
  'UI 检查通过：无裸色值、任意字号、任意圆角/阴影、页面裸 img、金色实底按钮与页面本地状态色映射。',
)
