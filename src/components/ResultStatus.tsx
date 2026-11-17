import { AlertTriangle, CircleCheck, CircleX, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const STATUS = {
  success: { icon: CircleCheck, className: 'bg-success/10 text-success' },
  error: { icon: CircleX, className: 'bg-destructive/10 text-destructive' },
  warning: { icon: AlertTriangle, className: 'bg-warning/10 text-warning' },
  info: { icon: Info, className: 'bg-info/10 text-info' },
} as const

export type ResultStatusKind = keyof typeof STATUS

/**
 * 流程结果页：提交成功、电子签完成、支付成功 / 失败、退回完成。
 * 不自动跳转；失败与警告态必须由页面提供下一步动作。
 */
export function ResultStatus({
  status,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: {
  status: ResultStatusKind
  title: string
  description?: ReactNode
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  className?: string
}) {
  const { icon: Icon, className: toneClass } = STATUS[status]

  return (
    <div role="status" className={cn('flex flex-col items-center text-center', className)}>
      <div
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-full',
          toneClass,
        )}
      >
        <Icon size={32} />
      </div>
      <h2 className="mt-4 text-title text-foreground">{title}</h2>
      {description ? (
        <div className="mt-2 text-body text-muted-foreground">{description}</div>
      ) : null}
      {primaryAction || secondaryAction ? (
        <div className="mt-6 flex w-full flex-col gap-2">
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  )
}
