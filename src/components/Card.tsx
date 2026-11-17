import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

const PADDING: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

/**
 * 卡片：白底 + 1px 描边 + 最轻阴影。
 * 内边距只从 sm/md/lg 取，页面不再自己写 p-3 / p-4；
 * 列表型卡片（内部是 ListItem）用 none，避免双重内边距。
 */
export function Card({
  padding = 'none',
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { padding?: CardPadding }) {
  return (
    <div
      className={cn('rounded-lg bg-card ring-1 ring-border shadow-xs', PADDING[padding], className)}
      {...props}
    />
  )
}
