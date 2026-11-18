import type { ReactNode } from 'react'
import { Button } from './Button'
import { PriceText } from './PriceText'
import type { PriceSize } from './PriceText'
import { cn } from '@/lib/utils'

const PLACEHOLDER_SIZE: Partial<Record<PriceSize, string>> = {
  display: 'text-display',
  title: 'text-title',
  section: 'text-section',
  'card-title': 'text-card-title',
  body: 'text-body-strong',
}

/**
 * 吸底「金额摘要 + 主行动」条：左侧件数/金额，右侧主按钮。
 * 只负责内容，外层容器仍用 BottomActionBar（DetailPage 的 footer 已内置）。
 * - onExplain 存在时左侧整块可点，并显示问号胶囊，用于打开金额明细
 * - amount 为 null 时展示占位「¥ —」，避免估价未算出时空位跳动
 */
export function SummaryActionBar({
  caption,
  label,
  amount,
  prefix = '¥',
  decimals = 2,
  amountSize = 'section',
  onExplain,
  explainLabel = '查看金额明细',
  actionLabel,
  onAction,
  actionDisabled = false,
  actionLoading = false,
  actionSize = 'md',
  actionClassName,
  className,
}: {
  /** 金额上方的小字，如「共 3 件商品」 */
  caption?: ReactNode
  /** 金额前的行内说明，如「合计」「预估回收价」 */
  label?: ReactNode
  amount: number | null
  prefix?: string
  decimals?: number
  amountSize?: PriceSize
  onExplain?: () => void
  explainLabel?: string
  actionLabel: ReactNode
  onAction: () => void
  actionDisabled?: boolean
  actionLoading?: boolean
  actionSize?: 'sm' | 'md' | 'lg'
  actionClassName?: string
  className?: string
}) {
  const summary = (
    <>
      {caption ? <p className="text-caption text-subtle-foreground">{caption}</p> : null}
      <div className={cn('flex items-center gap-1', caption && 'mt-0.5')}>
        {label ? (
          <span className="shrink-0 text-caption text-muted-foreground">{label}</span>
        ) : null}
        {amount === null ? (
          <span
            className={cn(
              'tabular text-muted-foreground',
              PLACEHOLDER_SIZE[amountSize] ?? 'text-section',
            )}
          >
            {prefix} —
          </span>
        ) : (
          <PriceText
            value={amount}
            prefix={prefix}
            size={amountSize}
            tone="price"
            decimals={decimals}
          />
        )}
        {onExplain ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-100 text-caption text-gold-700 ring-1 ring-gold-200 transition active:scale-95">
            ?
          </span>
        ) : null}
      </div>
    </>
  )

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {onExplain ? (
        <button
          type="button"
          onClick={onExplain}
          aria-label={explainLabel}
          className="min-w-0 flex-1 text-left"
        >
          {summary}
        </button>
      ) : (
        <div className="min-w-0 flex-1">{summary}</div>
      )}
      <Button
        size={actionSize}
        onClick={onAction}
        disabled={actionDisabled}
        loading={actionLoading}
        className={cn('shrink-0', actionClassName)}
      >
        {actionLabel}
      </Button>
    </div>
  )
}
