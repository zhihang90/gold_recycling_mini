import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string
  value: string
  hint?: string
  icon?: LucideIcon
  className?: string
}) {
  return (
    <div className={cn('rounded-lg bg-card p-3 ring-1 ring-border shadow-xs', className)}>
      <div className="flex items-center justify-between">
        <span className="text-label text-muted-foreground">{label}</span>
        {Icon ? <Icon size={16} className="text-subtle-foreground" /> : null}
      </div>
      <div className="mt-1 text-card-title tabular text-foreground">{value}</div>
      {hint ? <div className="mt-1 text-caption text-subtle-foreground">{hint}</div> : null}
    </div>
  )
}
