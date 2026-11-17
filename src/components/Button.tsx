import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { buttonStyles } from './buttonStyles'
import type { ButtonSize, ButtonVariant } from './buttonStyles'

/**
 * 按钮：全站唯一行动原语。
 * - primary 一屏只放 1 个；secondary 用于次行动；tertiary / text 用于取消与行内跳转；danger 用于删除类操作
 * - icon 尺寸只放一个图标，必须传 aria-label
 * - loading 只负责禁用与转圈，不做业务提示
 * - 不内置 toast / 导航，避免组件替页面做业务决策
 */
export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  className,
  type = 'button',
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  loading?: boolean
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, block, className })}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
