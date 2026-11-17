import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type IconButtonVariant = 'ghost' | 'outline'

const VARIANT: Record<IconButtonVariant, string> = {
  ghost: 'bg-transparent text-foreground active:bg-surface-2',
  outline: 'bg-card text-foreground ring-1 ring-border active:bg-surface-2',
}

/**
 * 图标按钮：关闭、分享、搜索等单图标操作。
 * 点击区固定 44×44；label 同时作为 aria-label 与 title，页面不再手写图标按钮。
 */
export function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon
  label: string
  variant?: IconButtonVariant
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:text-ink-400',
        VARIANT[variant],
        className,
      )}
      {...props}
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  )
}
