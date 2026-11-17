import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center px-8 py-8 text-center', className)}>
      <Icon size={48} className="mb-4 text-ink-400" />
      <div className="text-card-title text-foreground">{title}</div>
      {description ? (
        <div className="mt-2 max-w-[240px] text-body text-subtle-foreground">{description}</div>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
