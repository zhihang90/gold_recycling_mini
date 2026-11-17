import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface QuickAction {
  key: string
  label: string
  icon: LucideIcon
  onClick?: () => void
}

/**
 * 四格快捷入口：订单状态、首页常用操作共用。
 * 每格点击区 ≥64 高，图标与文案的间距、颜色固定在这里。
 */
export function QuickActionGrid({
  items,
  className,
}: {
  items: QuickAction[]
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-md text-body text-foreground transition active:bg-surface-2"
          >
            <Icon size={22} className="text-icon-strong" aria-hidden="true" />
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
