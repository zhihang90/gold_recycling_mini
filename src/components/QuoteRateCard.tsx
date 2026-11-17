import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Badge, type BadgeTone } from './Badge'
import { Button } from './Button'
import { Card } from './Card'
import { PriceText } from './PriceText'

export type QuoteRateStatus = 'live' | 'delayed' | 'halted'

/**
 * 状态只表达数据质量，不表达涨跌，因此不使用红色系。
 * 涨跌一律用中性文案 + 箭头，避免与品牌行动红混淆。
 */
const STATUS: Record<QuoteRateStatus, { tone: BadgeTone; text: string }> = {
  live: { tone: 'neutral', text: '实时' },
  delayed: { tone: 'warning', text: '延迟' },
  halted: { tone: 'muted', text: '停报' },
}

/**
 * 参考金价卡：把「值 + 来源 + 更新时间 + 有效性」绑成一个整体。
 * - 一屏只放一张，不与预估价、终价同卡展示
 * - source / updatedAt 缺一不可，避免出现无出处的金价
 * - halted 时主值显示「—」，降级说明由页面在卡外补 InlineNotice
 */
export function QuoteRateCard({
  label,
  price,
  source,
  updatedAt,
  status = 'live',
  validUntil,
  footnote,
  statusText,
  onExplain,
  explainLabel,
  className,
}: {
  label: string
  price: number
  source: string
  updatedAt: string
  status?: QuoteRateStatus
  /** 估价有效期 / 报价截止时间，仅作说明，不驱动倒计时 */
  validUntil?: string
  footnote?: ReactNode
  /** 覆盖默认状态文案（实时 / 延迟 / 停报） */
  statusText?: string
  onExplain?: () => void
  explainLabel?: string
  className?: string
}) {
  const meta = STATUS[status]

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-label text-muted-foreground">{label}</span>
        <Badge tone={meta.tone}>{statusText ?? meta.text}</Badge>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-3">
        {status === 'halted' ? (
          <span className="text-title text-ink-400">—</span>
        ) : (
          <PriceText
            value={price}
            size="title"
            tone={status === 'delayed' ? 'muted' : 'gold'}
            suffix="/克"
          />
        )}
        {onExplain ? (
          <Button variant="text" size="sm" onClick={onExplain} className="shrink-0">
            {explainLabel}
          </Button>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-subtle-foreground">
        <span className="tabular">{source}</span>
        <span aria-hidden>·</span>
        <span className="tabular">{updatedAt}</span>
        {validUntil ? (
          <>
            <span aria-hidden>·</span>
            <span className="tabular">{validUntil}</span>
          </>
        ) : null}
      </div>

      {footnote ? (
        <div className="mt-2 text-caption text-subtle-foreground">{footnote}</div>
      ) : null}
    </Card>
  )
}
