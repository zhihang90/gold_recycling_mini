import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * 分类 / 筛选 chip：胶囊形态，只表达筛选条件，不承载主行动。
 * 与 Button 分工：Button 用圆角 12 的方形态，chip 用胶囊；页面不再用 Button 覆写 rounded-full。
 */
export function Chip({
  active = false,
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        'inline-flex h-8 shrink-0 items-center justify-center rounded-full px-3.5 text-body transition',
        active
          ? 'bg-primary-soft text-primary ring-1 ring-primary-border'
          : 'bg-card text-muted-foreground ring-1 ring-border-subtle',
        className,
      )}
      {...props}
    />
  )
}
