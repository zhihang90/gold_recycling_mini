import { cn } from '@/lib/utils'

export type TimelineState = 'done' | 'current' | 'pending'

export type TimelineItem = {
  key: string
  title: string
  description?: string
  time?: string
  state: TimelineState
}

/**
 * 纵向事件时间轴：物流轨迹、检测记录、支付尝试、退回 / 复检记录。
 * 只做记录展示，不承担状态迁移；异常提示由页面用 InlineNotice 放在轨迹上方。
 */
export function StatusTimeline({
  items,
  className,
}: {
  items: TimelineItem[]
  className?: string
}) {
  return (
    <ul className={cn('space-y-0', className)}>
      {items.map((item, index) => {
        const last = index === items.length - 1
        return (
          <li key={item.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'mt-1 h-2 w-2 shrink-0 rounded-full',
                  item.state === 'current' && 'bg-primary ring-4 ring-primary-soft',
                  item.state === 'done' && 'bg-ink-400',
                  item.state === 'pending' && 'bg-line',
                )}
              />
              {last ? null : <span className="mt-1 w-0.5 flex-1 bg-line-soft" />}
            </div>

            <div className={cn('min-w-0 flex-1', last ? 'pb-0' : 'pb-4')}>
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={cn(
                    'text-body-strong',
                    item.state === 'pending' ? 'text-subtle-foreground' : 'text-foreground',
                  )}
                >
                  {item.title}
                </span>
                {item.time ? (
                  <span className="shrink-0 text-caption text-subtle-foreground tabular">
                    {item.time}
                  </span>
                ) : null}
              </div>
              {item.description ? (
                <p className="mt-1 text-body text-muted-foreground">{item.description}</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
