import { Badge, Card, PriceText } from '@/components'
import type { BadgeTone } from '@/components'
import type { ReactNode } from 'react'

/**
 * 订单卡：列表里统一「单号 + 状态 + 物品摘要 + 金额 + 下一步」。
 * 状态文案与色调由页面按订单主状态映射后传入，组件不做状态机判断。
 */
export function OrderCard({
  orderNo,
  statusLabel,
  statusTone = 'neutral',
  title,
  meta,
  amount,
  amountLabel,
  actions,
  onClick,
  className,
}: {
  orderNo: string
  statusLabel: string
  statusTone?: BadgeTone
  title: string
  meta?: ReactNode
  amount?: number | string
  amountLabel?: string
  actions?: ReactNode
  onClick?: () => void
  className?: string
}) {
  const head = (
    <>
      <div className="truncate text-caption text-subtle-foreground tabular">{orderNo}</div>
      <div className="mt-1 text-card-title text-foreground">{title}</div>
    </>
  )

  return (
    <Card className={className ? `p-4 ${className}` : 'p-4'}>
      <div className="flex items-start justify-between gap-3">
        {onClick ? (
          <button type="button" onClick={onClick} className="min-w-0 flex-1 text-left">
            {head}
          </button>
        ) : (
          <div className="min-w-0 flex-1">{head}</div>
        )}
        <Badge tone={statusTone} size="sm">
          {statusLabel}
        </Badge>
      </div>

      {meta ? <div className="mt-2 text-body text-muted-foreground">{meta}</div> : null}

      <div className="mt-3 flex items-end justify-between gap-3 border-t border-line-soft pt-3">
        <div className="min-w-0">
          {amountLabel ? (
            <div className="text-caption text-subtle-foreground">{amountLabel}</div>
          ) : null}
          {typeof amount !== 'undefined' ? (
            <PriceText value={amount} size="card-title" tone="ink" />
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </Card>
  )
}
