import { cn } from '@/lib/utils'

export type CompareColumn = { key: string; label: string }
export type CompareValue = string | number | null | undefined

export type CompareRow = {
  label: string
  /** 顺序与 columns 一致；null / undefined / 空串统一渲染为「—」 */
  values: CompareValue[]
  /** 差异说明，放在首列下方，例如「较预估 −0.26 克」 */
  delta?: string
  /** 是否显著差异，由页面用 isSignificantDiff 计算后传入 */
  highlight?: boolean
}

const HIGHLIGHT = {
  warning: 'text-warning',
  danger: 'text-destructive',
} as const

/**
 * 预估 / 实测 / 熔后复检 对照。
 * - 默认 3 列；传 2 列自动退化为两列，超过 3 列在 375 宽下不可读
 * - **不内置差异阈值**：是否高亮只认 highlight，阈值用 `@/lib/diff` 统一
 * - 缺失值显示「—」而不是 0，避免被读成归零
 * - 只做对照，不写解释；原因交给 InlineNotice 或页面段落
 */
export function CompareRows({
  columns,
  rows,
  firstColumnLabel,
  highlightTone = 'warning',
  className,
}: {
  columns: CompareColumn[]
  rows: CompareRow[]
  firstColumnLabel?: string
  highlightTone?: keyof typeof HIGHLIGHT
  className?: string
}) {
  /** 3 列时数值列收窄，保证首列标签在 375 宽下不被截断 */
  const valueCell = columns.length >= 3 ? 'w-14' : 'w-20'

  return (
    <div className={cn('w-full', className)} role="table">
      <div role="row" className="flex items-baseline gap-2 border-b border-line-soft pb-2">
        <span
          role="columnheader"
          className="min-w-0 flex-1 text-caption text-subtle-foreground"
        >
          {firstColumnLabel}
        </span>
        {columns.map((column) => (
          <span
            key={column.key}
            role="columnheader"
            className={cn(
              'shrink-0 text-right text-caption text-subtle-foreground',
              valueCell,
            )}
          >
            {column.label}
          </span>
        ))}
      </div>

      {rows.map((row, rowIndex) => (
        <div
          key={`${row.label}-${rowIndex}`}
          role="row"
          className="flex items-baseline gap-2 border-t border-line-soft py-2"
        >
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                'truncate text-body text-foreground',
                row.highlight && HIGHLIGHT[highlightTone],
              )}
            >
              {row.label}
            </div>
            {row.delta ? (
              <div
                className={cn(
                  'text-caption tabular',
                  row.highlight ? HIGHLIGHT[highlightTone] : 'text-subtle-foreground',
                )}
              >
                {row.delta}
              </div>
            ) : null}
          </div>

          {columns.map((column, index) => {
            const value = row.values[index]
            return (
              <div
                key={column.key}
                role="cell"
                className={cn('shrink-0 text-right text-body tabular text-foreground', valueCell)}
              >
                {value === null || value === undefined || value === '' ? '—' : value}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
