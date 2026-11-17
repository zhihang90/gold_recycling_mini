import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function KeyValueRow({
  label,
  value,
  emphasis,
  hint,
  className,
}: {
  label: string
  value: ReactNode
  emphasis?: boolean
  hint?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 py-2 text-body', className)}>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={cn('min-w-0 text-right text-foreground', emphasis && 'text-body-strong')}>
        {value}
        {hint ? <span className="ml-1 text-caption text-subtle-foreground">{hint}</span> : null}
      </span>
    </div>
  )
}
