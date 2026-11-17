import type { ReactNode } from 'react'
import { PageShell } from './PageShell'
import { PageHeader } from './PageHeader'
import { BottomActionBar } from './BottomActionBar'
import { cn } from '@/lib/utils'

/**
 * 二级页模板：带返回键与标题，可选吸底操作栏。
 * footer 只放操作按钮；吸底栏已处理安全区，页面不要自己写 position: fixed。
 */
export function DetailPage({
  title,
  right,
  onBack,
  footer,
  padded = true,
  children,
  className,
  contentClassName,
}: {
  title?: string
  right?: ReactNode
  onBack?: () => void
  footer?: ReactNode
  padded?: boolean
  children?: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <PageShell className={className}>
      <PageHeader title={title} right={right} onBack={onBack} />
      <div className={cn('flex-1', padded && 'space-y-4 px-4 pt-4', contentClassName)}>{children}</div>
      {footer ? <BottomActionBar>{footer}</BottomActionBar> : null}
    </PageShell>
  )
}
