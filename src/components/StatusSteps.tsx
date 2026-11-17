import { cn } from '@/lib/utils'

/**
 * 订单主链进度：待寄出 → 待签收 → 检测中 → 待确认 → 待打款 → 已完成。
 * 已取消 / 已关闭属于终态，不进步骤条，由页面用提示层表达。
 */
export function StatusSteps({
  steps,
  currentIndex,
  className,
}: {
  steps: { key: string; label: string }[]
  currentIndex: number
  className?: string
}) {
  return (
    <ol className={cn('hide-scrollbar flex items-start overflow-x-auto', className)}>
      {steps.map((step, index) => {
        const done = index < currentIndex
        const current = index === currentIndex

        return (
          <li
            key={step.key}
            aria-current={current ? 'step' : undefined}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <div className="flex w-full items-center">
              <span
                className={cn(
                  'h-0.5 flex-1',
                  index === 0 && 'invisible',
                  done || current ? 'bg-primary' : 'bg-line',
                )}
              />
              <span
                className={cn(
                  'h-2 w-2 shrink-0 rounded-full',
                  current && 'ring-4 ring-primary-soft',
                  done || current ? 'bg-primary' : 'bg-line',
                )}
              />
              <span
                className={cn(
                  'h-0.5 flex-1',
                  index === steps.length - 1 && 'invisible',
                  done ? 'bg-primary' : 'bg-line',
                )}
              />
            </div>
            <span
              className={cn(
                'whitespace-nowrap text-caption',
                current
                  ? 'text-body-strong text-primary-active'
                  : done
                    ? 'text-ink-700'
                    : 'text-subtle-foreground',
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
