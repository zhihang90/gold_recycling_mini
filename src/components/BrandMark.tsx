import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 品牌图标底：登录页与个人中心共用，避免两处各写一遍金色圆形底。
 * 只做装饰，不承载业务状态。
 */
export function BrandMark({
  icon: Icon,
  size = 'md',
  className,
}: {
  icon: LucideIcon
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground',
        size === 'md' ? 'h-14 w-14' : 'h-10 w-10',
        className,
      )}
    >
      <Icon size={size === 'md' ? 28 : 20} aria-hidden="true" />
    </span>
  )
}
