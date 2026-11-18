import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ORDER_STATUS_TONE_CLASS, type OrderStatusTone } from '@/lib/statusTone'

/**
 * 订单状态头部：居中大标题 + 可选的异常 / 取消原因与补充说明。
 * 只展示状态文案，不内置订单状态枚举，状态映射由业务数据层负责。
 */
export function OrderStatusHeader({
  status,
  reason,
  note,
  tone = 'default',
  className,
}: {
  status: string
  reason?: ReactNode
  note?: ReactNode
  tone?: OrderStatusTone
  className?: string
}) {
  return (
    <div className={cn('py-2 text-center', className)}>
      <h1 className={cn('text-section', ORDER_STATUS_TONE_CLASS[tone])}>{status}</h1>
      {reason ? <p className="mt-1 text-body text-muted-foreground">{reason}</p> : null}
      {note ? <p className="mt-1 text-caption text-subtle-foreground">{note}</p> : null}
    </div>
  )
}
