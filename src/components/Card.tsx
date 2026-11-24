import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

const PADDING: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

const HOVER =
  'transition-all duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-gold-400/60 hover:shadow-sm cursor-pointer'

/**
 * 卡片：白底 + 1px 描边 + 最轻阴影。
 * 内边距只从 sm/md/lg 取，页面不再自己写 p-3 / p-4；
 * 列表型卡片（内部是 ListItem）用 none，避免双重内边距。
 *
 * hover 效果可选用：hover 激活后卡片轻微上浮 + 金色描边加深 + 阴影增强。
 */
export function Card({
  padding = 'none',
  hover = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { padding?: CardPadding; hover?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-card ring-1 ring-border shadow-xs',
        PADDING[padding],
        hover && HOVER,
        className,
      )}
      {...props}
    />
  )
}
