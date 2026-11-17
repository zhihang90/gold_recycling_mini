import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SearchBar({
  placeholder = '搜索品类或回收单号',
  value,
  onChange,
  onClick,
  className,
}: {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onClick?: () => void
  className?: string
}) {
  const inner = (
    <>
      <Search size={16} className="shrink-0 text-subtle-foreground" />
      {onChange ? (
        <input
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-subtle-foreground"
        />
      ) : (
        <span className="flex-1 text-left text-body text-subtle-foreground">{placeholder}</span>
      )}
    </>
  )

  const base = cn(
    'flex min-h-11 w-full items-center gap-2 rounded-full bg-card px-4 ring-1 ring-border transition focus-within:ring-primary',
    onClick && 'active:bg-surface-2',
    className,
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={base}>
        {inner}
      </button>
    )
  }

  return <div className={base}>{inner}</div>
}
