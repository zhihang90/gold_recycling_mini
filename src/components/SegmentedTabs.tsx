import { cn } from '@/lib/utils'

export interface TabItem {
  value: string
  label: string
  count?: number
}

/**
 * 横向滑动标签组。
 * - 默认不换行，容器横向滚动并隐藏滚动条，右缘渐隐提示「还有更多」
 * - sticky 用于状态栏吸顶
 * - 计数按「文字 + 4px + 数字」呈现，不放进圆形角标
 */
export function SegmentedTabs({
  items,
  value,
  onChange,
  className,
  size = 'md',
  wrap = false,
  sticky = false,
  variant = 'pill',
  fill = false,
}: {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
  size?: 'sm' | 'md'
  wrap?: boolean
  sticky?: boolean
  variant?: 'pill' | 'underline'
  /** 等宽铺满：一级页面内的主 Tab 用，两个 Tab 各占一半 */
  fill?: boolean
}) {
  const track = (
    <div
      role={variant === 'underline' ? 'tablist' : undefined}
      className={cn(
        'flex',
        fill && 'w-full',
        variant === 'pill' ? 'gap-2' : 'border-b border-border-subtle',
        wrap ? 'flex-wrap' : 'hide-scrollbar overflow-x-auto',
        !wrap && variant === 'pill' && 'edge-fade pb-1',
      )}
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            role={variant === 'underline' ? 'tab' : undefined}
            aria-selected={variant === 'underline' ? active : undefined}
            className={cn(
              'flex min-h-8 shrink-0 items-center transition',
              fill && 'flex-1 justify-center',
              variant === 'underline'
                ? 'relative min-h-11 whitespace-nowrap px-4 text-body'
                : size === 'sm'
                  ? 'rounded-full px-3 text-label'
                  : 'rounded-full px-4 text-body-strong',
              active
                ? variant === 'underline'
                  ? 'text-body-strong text-gold-800 after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-gold-700'
                  : 'bg-primary-soft text-primary-active ring-1 ring-primary-border'
                : variant === 'underline'
                  ? 'text-muted-foreground'
                  : 'bg-card text-muted-foreground ring-1 ring-border',
            )}
          >
            {item.label}
            {item.count != null ? (
              <span className="ml-1 text-caption tabular">
                {item.count > 99 ? '99+' : item.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )

  if (!sticky) return <div className={className}>{track}</div>

  return (
    <div
      className={cn('sticky top-12 z-20 -mx-4 bg-background/95 px-4 py-2 backdrop-blur', className)}
    >
      {track}
    </div>
  )
}
