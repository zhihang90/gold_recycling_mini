import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  onBack,
  right,
  showBack = true,
  className,
}: {
  title?: string
  onBack?: () => void
  right?: ReactNode
  showBack?: boolean
  className?: string
}) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-border-subtle bg-background/92 px-4 py-0.5 backdrop-blur',
        className,
      )}
    >
      <div className="flex h-11 items-center gap-2">
        <div className="flex w-11 shrink-0 items-center justify-start">
          {showBack ? (
            <button
              type="button"
              onClick={() => (onBack ? onBack() : navigate(-1))}
              aria-label="返回"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition active:bg-surface-2"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
          ) : null}
        </div>
        {title ? (
          <div className="min-w-0 flex-1 truncate text-center text-card-title text-foreground">
            {title}
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex w-11 shrink-0 items-center justify-end">{right}</div>
      </div>
    </header>
  )
}
