import { cn } from '@/lib/utils'

/**
 * 加载骨架：替代整页转圈。
 * 动画由 index.css 的 .skeleton 提供（1.2s，line-soft ↔ line），prefers-reduced-motion 由全局降级。
 */
export function Skeleton({
  variant = 'rect',
  lines = 3,
  className,
}: {
  variant?: 'text' | 'rect' | 'circle'
  lines?: number
  className?: string
}) {
  if (variant === 'text') {
    return (
      <div aria-hidden="true" className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="skeleton h-4 rounded-xs" />
        ))}
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'skeleton',
        variant === 'circle' ? 'h-10 w-10 rounded-full' : 'h-16 w-full rounded-sm',
        className,
      )}
    />
  )
}
