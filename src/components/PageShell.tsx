import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageShell({
  children,
  className,
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <div className={cn('flex min-h-full flex-col bg-background', padded && 'pb-6', className)}>
      {children}
    </div>
  )
}
