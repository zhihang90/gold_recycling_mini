import { ChevronRight, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * 列表项：个人中心入口、消息、规则条目、订单信息摘要。
 * 单行至少 56 高，双行至少 72 高；可点项用原生 button，不可点项用 div。
 */
export function ListItem({
  title,
  description,
  icon: Icon,
  right,
  showArrow = false,
  divider = false,
  size = 'md',
  onClick,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  icon?: LucideIcon
  right?: ReactNode
  showArrow?: boolean
  divider?: boolean
  size?: 'md' | 'lg'
  onClick?: () => void
  className?: string
}) {
  const content = (
    <>
      {Icon ? <Icon size={20} className="shrink-0 text-icon-strong" /> : null}
      <span className="min-w-0 flex-1">
        <span className="block text-card-title text-foreground">{title}</span>
        {description ? (
          <span className="mt-1 block text-body text-muted-foreground">{description}</span>
        ) : null}
      </span>
      {right ? <span className="shrink-0 text-body text-muted-foreground">{right}</span> : null}
      {showArrow ? <ChevronRight size={16} className="shrink-0 text-icon-muted" /> : null}
    </>
  )

  const classes = cn(
    'flex w-full items-center gap-3 px-4 py-3 text-left',
    size === 'lg' ? 'min-h-18' : 'min-h-14',
    onClick && 'transition active:bg-surface-2',
    divider && 'border-b border-line-soft',
    className,
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    )
  }

  return <div className={classes}>{content}</div>
}
