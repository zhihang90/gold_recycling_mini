import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeTone =
  | 'neutral'
  | 'gold'
  | 'success'
  | 'warning'
  | 'danger'
  | 'violet'
  | 'info'
  | 'outline'
  | 'muted'
  | 'primary'

const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-muted-foreground',
  gold: 'bg-accent text-accent-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-destructive/10 text-destructive',
  violet: 'bg-violet/10 text-violet',
  info: 'bg-info/10 text-info',
  outline: 'bg-transparent text-muted-foreground ring-1 ring-border',
  muted: 'bg-surface-2 text-subtle-foreground',
  primary: 'bg-primary-soft text-primary ring-1 ring-primary-border',
}

export function Badge({
  tone = 'neutral',
  size = 'sm',
  className,
  children,
}: {
  tone?: BadgeTone
  size?: 'sm' | 'md'
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-xs px-2 text-caption whitespace-nowrap',
        size === 'sm' ? 'h-5' : 'h-6',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
