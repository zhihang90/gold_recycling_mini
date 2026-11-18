import { Fragment, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Block =
  | { type: 'h1' | 'h2' | 'h3' | 'p' | 'quote'; text: string }
  | { type: 'ol' | 'ul'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'hr' }

/** 单元格拆分：去掉首尾竖线后按竖线切分 */
function splitCells(line: string) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

/** 返回从 start 开始的下一条非空行下标；没有则返回行数 */
function nextContentLine(lines: string[], start: number) {
  let index = start
  while (index < lines.length && !lines[index].trim()) index += 1
  return index
}

/** 轻量 Markdown 解析：只覆盖协议文本用到的标题、段落、列表、表格、引用与分隔线 */
function parseMarkdown(source: string): Block[] {
  const lines = source.split('\n')
  const blocks: Block[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()

    if (!line) {
      index += 1
      continue
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1].length as 1 | 2 | 3
      blocks.push({ type: `h${level}` as 'h1' | 'h2' | 'h3', text: heading[2].trim() })
      index += 1
      continue
    }

    if (/^-{3,}$/.test(line)) {
      blocks.push({ type: 'hr' })
      index += 1
      continue
    }

    if (line.startsWith('|')) {
      const rows: string[][] = []
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        const cells = splitCells(lines[index])
        // 分隔行（|---|:--:|）不渲染
        if (!cells.every((cell) => /^:?-{2,}:?$/.test(cell))) rows.push(cells)
        index += 1
      }
      const [head, ...body] = rows
      if (head) blocks.push({ type: 'table', head, rows: body })
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length) {
        const current = lines[index].trim()
        if (/^\d+\.\s+/.test(current)) {
          items.push(current.replace(/^\d+\.\s+/, ''))
          index += 1
          continue
        }
        // 协议原文的编号项之间有空行：向后看一行仍是编号项时才继续同一列表
        const next = nextContentLine(lines, index)
        if (next < lines.length && /^\d+\.\s+/.test(lines[next].trim())) {
          index = next
          continue
        }
        break
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length) {
        const current = lines[index].trim()
        if (/^[-*]\s+/.test(current)) {
          items.push(current.replace(/^[-*]\s+/, ''))
          index += 1
          continue
        }
        const next = nextContentLine(lines, index)
        if (next < lines.length && /^[-*]\s+/.test(lines[next].trim())) {
          index = next
          continue
        }
        break
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    if (line.startsWith('>')) {
      const items: string[] = []
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        items.push(lines[index].trim().replace(/^>\s?/, ''))
        index += 1
      }
      blocks.push({ type: 'quote', text: items.join('') })
      continue
    }

    blocks.push({ type: 'p', text: line })
    index += 1
  }

  return blocks
}

/** 行内加粗：**文字** 转为 strong，其余原样输出 */
function renderInline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-medium text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

/**
 * 协议正文渲染：原文是 Markdown，项目不引 markdown 依赖，
 * 这里只实现协议用到的语法，保证正文文字与原文一致。
 */
export function MarkdownDoc({
  source,
  className,
}: {
  source: string
  className?: string
}) {
  const blocks = parseMarkdown(source)

  return (
    <div className={cn('space-y-3 text-caption text-muted-foreground', className)}>
      {blocks.map((block, blockIndex) => {
        switch (block.type) {
          case 'h1':
            return (
              <h2 key={blockIndex} className="text-center text-card-title text-foreground">
                {block.text}
              </h2>
            )
          case 'h2':
            return (
              <h3 key={blockIndex} className="pt-2 text-body-strong text-foreground">
                {block.text}
              </h3>
            )
          case 'h3':
            return (
              <h4 key={blockIndex} className="pt-1 text-caption-strong text-foreground">
                {block.text}
              </h4>
            )
          case 'ol':
            return (
              <ol key={blockIndex} className="list-decimal space-y-1.5 pl-5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </ol>
            )
          case 'ul':
            return (
              <ul key={blockIndex} className="list-disc space-y-1.5 pl-5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </ul>
            )
          case 'table':
            return (
              <div key={blockIndex} className="overflow-x-auto">
                <table className="w-full border-collapse text-caption">
                  <thead>
                    <tr>
                      {block.head.map((cell, cellIndex) => (
                        <th
                          key={cellIndex}
                          className="border border-border-subtle bg-surface-2 px-2 py-1.5 text-left font-medium text-foreground"
                        >
                          {renderInline(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border border-border-subtle px-2 py-1.5 align-top"
                          >
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case 'quote':
            return (
              <blockquote
                key={blockIndex}
                className="border-l-2 border-gold-300 bg-gold-50/60 px-3 py-2"
              >
                {renderInline(block.text)}
              </blockquote>
            )
          case 'hr':
            return <hr key={blockIndex} className="border-border-subtle" />
          default:
            return (
              <p key={blockIndex} className="leading-relaxed">
                {renderInline(block.text)}
              </p>
            )
        }
      })}
    </div>
  )
}
