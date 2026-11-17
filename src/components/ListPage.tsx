import type { ReactNode } from 'react'
import { PageShell } from './PageShell'
import { PageHeader } from './PageHeader'
import { BottomActionBar } from './BottomActionBar'
import { EmptyState } from './EmptyState'
import { Skeleton } from './Skeleton'
import { cn } from '@/lib/utils'

/**
 * 列表页模板：标题 + 可选筛选槽 + 加载/空/有数据三态 + 可选吸底操作栏。
 * 列表项间距统一 12px；筛选区只放 SegmentedTabs / SearchBar 一类控件。
 */
export function ListPage({
  title,
  right,
  onBack,
  showBack = false,
  filters,
  loading = false,
  isEmpty = false,
  empty,
  footer,
  children,
  className,
  contentClassName,
}: {
  title: string
  right?: ReactNode
  onBack?: () => void
  showBack?: boolean
  filters?: ReactNode
  loading?: boolean
  isEmpty?: boolean
  empty?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <PageShell className={className}>
      <PageHeader title={title} right={right} onBack={onBack} showBack={showBack} />
      {filters ? <div className="px-4 pt-3">{filters}</div> : null}
      <div className={cn('flex-1 px-4 pt-3', footer && 'pb-4', contentClassName)}>
        {loading ? (
          <div className="space-y-3">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        ) : isEmpty ? (
          (empty ?? <EmptyState title="暂无内容" />)
        ) : (
          <div className="space-y-3">{children}</div>
        )}
      </div>
      {footer ? <BottomActionBar>{footer}</BottomActionBar> : null}
    </PageShell>
  )
}
