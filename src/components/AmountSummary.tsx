import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card } from './Card'
import { PriceText } from './PriceText'

export interface AmountSummaryRow {
  label: string
  /** 负数自动显示为 −¥；也可传 prefix 覆盖 */
  value: number
  hint?: ReactNode
  prefix?: string
  tone?: 'default' | 'muted'
}

/**
 * 金额明细：逐项金额 + 合计 + 口径说明。
 * 只做展示与符号排版，不参与计价；扣减项传几项就渲染几项，不允许按条件隐藏。
 */
export function AmountSummary({
  rows,
  total,
  footnote,
  className,
}: {
  rows: AmountSummaryRow[]
  total: {
    label: string
    value: number
    badge?: ReactNode
    note?: ReactNode
  }
  footnote?: ReactNode
  className?: string
}) {
  return (
    <Card padding="md" className={cn('space-y-1', className)}>
      {rows.map((row, index) => (
        <div
          key={`${row.label}-${index}`}
          className="flex items-start justify-between gap-3 py-2 text-body"
        >
          <div className="min-w-0">
            <div className="text-muted-foreground">{row.label}</div>
            {row.hint ? (
              <div className="mt-0.5 text-caption text-subtle-foreground">{row.hint}</div>
            ) : null}
          </div>
          <PriceText
            value={Math.abs(row.value)}
            prefix={row.prefix ?? (row.value < 0 ? '−¥' : '¥')}
            size="body"
            tone={row.tone === 'muted' ? 'muted' : 'ink'}
            className="shrink-0"
          />
        </div>
      ))}

      <div className="flex items-baseline justify-between gap-3 border-t border-border-subtle pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-body-strong text-foreground">{total.label}</span>
          {total.badge ? <span className="shrink-0">{total.badge}</span> : null}
        </div>
        <PriceText value={total.value} size="title" tone="price" className="shrink-0" />
      </div>

      {total.note ? (
        <div className="text-right text-caption text-subtle-foreground">{total.note}</div>
      ) : null}

      {footnote ? (
        <div className="mt-1 border-t border-border-subtle pt-3 text-caption text-subtle-foreground">
          {footnote}
        </div>
      ) : null}
    </Card>
  )
}
