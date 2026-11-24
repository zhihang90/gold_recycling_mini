import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface QuickAction {
  key: string
  label: string
  icon: LucideIcon
  /** 图标方形底（如 bg-primary/10）；传了就渲染为带色块的方形图标 */
  iconBg?: string
  /** 图标前景色（如 text-primary）；配合 iconBg 使用 */
  iconFg?: string
  /** 右上角数量角标，0 或未传时不展示 */
  badge?: number
  onClick?: () => void
}

/**
 * 快捷入口宫格：订单状态、首页常用操作共用，支持 4 / 5 列。
 * 每格点击区 ≥64 高，图标与文案的间距、颜色固定在这里。
 */
export function QuickActionGrid({
  items,
  columns = 4,
  separateLast = true,
  className,
}: {
  items: QuickAction[]
  columns?: 4 | 5
  /** 5 列时最后一项默认用竖线与前四项分组（订单「全部」入口）；同权入口传 false */
  separateLast?: boolean
  className?: string
}) {
  return (
    <div className={cn('grid gap-2', columns === 5 ? 'grid-cols-5' : 'grid-cols-4', className)}>
      {items.map((item, index) => {
        const Icon = item.icon
        const isLastInFive = separateLast && columns === 5 && index === items.length - 1
        return (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            className="relative flex min-h-16 flex-col items-center justify-center gap-2 rounded-md text-body text-foreground transition active:bg-surface-2"
          >
            {isLastInFive ? (
              <>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-3 left-0 w-px bg-border-subtle"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-3 left-px w-2 bg-gradient-to-r from-border-subtle/60 to-transparent"
                />
              </>
            ) : null}
            <span
              className={cn(
                'relative flex items-center justify-center',
                item.iconBg && item.iconFg && 'h-10 w-10 rounded-md',
                item.iconBg && item.iconFg && item.iconBg,
              )}
            >
              <Icon
                size={item.iconBg && item.iconFg ? 20 : 22}
                className={item.iconFg ?? 'text-icon-strong'}
                aria-hidden="true"
              />
              {item.badge ? (
                <span className="absolute -top-2 -right-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-caption leading-none text-destructive-foreground tabular">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              ) : null}
            </span>
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
