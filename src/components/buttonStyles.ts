import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'text' | 'danger'
export type ButtonSize = 'lg' | 'md' | 'sm' | 'icon'

const BASE =
  'relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md transition disabled:cursor-not-allowed disabled:bg-muted disabled:text-ink-400 disabled:ring-0'

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground active:bg-primary-active',
  secondary: 'bg-card text-primary ring-1 ring-primary-border active:bg-primary-soft',
  tertiary: 'bg-transparent text-ink-500 active:bg-surface-2',
  text: 'bg-transparent px-0 text-primary active:text-primary-active',
  danger: 'bg-destructive text-destructive-foreground active:bg-destructive/90',
}

const SIZE: Record<ButtonSize, string> = {
  lg: 'h-12 px-5 text-body-strong',
  md: 'h-11 px-4 text-body-strong',
  // 视觉 36，靠 after 的上下各 4px 把点击区补到 44
  sm: 'h-9 px-3 text-label after:absolute after:inset-x-0 after:-inset-y-1 after:content-[""]',
  icon: 'h-11 w-11 p-0',
}

/**
 * 按钮样式表：Button 与需要「按钮样式的链接」（<Link>）共用，避免页面另写一套。
 * 颜色只走 tokens.css 的语义别名，不直接引用 red-*。
 */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  className?: string
} = {}) {
  return cn(BASE, SIZE[size], VARIANT[variant], block && 'w-full', className)
}
