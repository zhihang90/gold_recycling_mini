import type { ReactNode } from 'react'
import { PageShell } from './PageShell'
import { PageHeader } from './PageHeader'
import { cn } from '@/lib/utils'

/**
 * 一级页模板：底部 Tab 承载导航，因此不显示返回键。
 * 标题可选：首页等由内容区块承接层级的页面不传 title。
 * 内容区统一 16px 左右留白 + 16px 区块间距，页面不再自己拼 space-y / px。
 */
export function TabPage({
  title,
  right,
  children,
  className,
  contentClassName,
}: {
  title?: string
  right?: ReactNode
  children?: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <PageShell className={className}>
      {title ? <PageHeader title={title} showBack={false} right={right} /> : null}
      <div className={cn('flex-1 space-y-4 px-4 pt-4', contentClassName)}>{children}</div>
    </PageShell>
  )
}
