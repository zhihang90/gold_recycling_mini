import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Stepper({
  value,
  min = 1,
  max = 99,
  onChange,
  size = 'md',
  className,
}: {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  size?: 'sm' | 'md'
  className?: string
}) {
  const btn =
    'flex items-center justify-center rounded-md text-foreground transition disabled:text-subtle-foreground/60 active:bg-surface-2'
  const dim = 'h-11 w-11'

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <button
        type="button"
        aria-label="减少"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn(btn, dim)}
      >
        <Minus size={16} />
      </button>
      <span
        className={cn(
          'text-center tabular',
          size === 'sm' ? 'w-5 text-caption-strong' : 'w-6 text-body-strong',
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="增加"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn(btn, dim)}
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
