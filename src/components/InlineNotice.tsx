import type { ReactNode } from 'react'
import { AlertTriangle, CircleCheck, CircleX, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NoticeTone = 'info' | 'warning' | 'danger' | 'success'

const STYLE: Record<NoticeTone, string> = {
  info: 'bg-info/8 ring-info/20 text-info',
  warning: 'bg-warning/8 ring-warning/20 text-warning',
  danger: 'bg-destructive/8 ring-destructive/20 text-destructive',
  success: 'bg-success/8 ring-success/20 text-success',
}

const ICON = {
  info: Info,
  warning: AlertTriangle,
  danger: CircleX,
  success: CircleCheck,
}

export function InlineNotice({
  tone = 'info',
  title,
  children,
  action,
  className,
}: {
  tone?: NoticeTone
  title?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  const Icon = ICON[tone]
  return (
    <div className={cn('rounded-lg px-3 py-3 ring-1', STYLE[tone], className)}>
      <div className="flex gap-2">
        <Icon size={16} className="mt-1 shrink-0" />
        <div className="min-w-0 flex-1">
          {title ? <div className="text-body-strong">{title}</div> : null}
          <div className="text-body opacity-90">{children}</div>
          {action ? <div className="mt-2">{action}</div> : null}
        </div>
      </div>
    </div>
  )
}
