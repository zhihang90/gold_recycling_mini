import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * 协议 / 来源 / 破检授权勾选。
 * 右侧文案可包含行内协议链接，因此只有圆形勾选框本身可点，避免按钮嵌套。
 * 勾选框 20px 视觉，点击热区通过伪元素扩到 44；永不默认勾选；错误提示留在行下方。
 */
export function AgreementCheck({
  checked,
  onChange,
  children,
  error,
  shape = 'square',
  disabled = false,
  align = 'start',
  className,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  error?: string
  /** circle 用于登录页这类轻量协议行，square 用于逐条确认的授权条款 */
  shape?: 'square' | 'circle'
  disabled?: boolean
  /** start 顶部对齐（默认，适合多行内容）；center 垂直居中（适合单行协议行） */
  align?: 'start' | 'center'
  className?: string
}) {
  return (
    <div className={className}>
      <div className={cn('flex gap-3 py-2', align === 'center' ? 'items-center' : 'items-start')}>
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label={typeof children === 'string' ? children : '同意协议'}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative flex h-5 w-5 shrink-0 items-center justify-center ring-1 transition after:absolute after:-inset-3 after:content-[""]',
            align === 'start' && 'mt-0.5',
            shape === 'circle' ? 'rounded-full' : 'rounded-xs',
            checked
              ? 'bg-primary text-primary-foreground ring-primary'
              : cn('bg-card text-transparent', shape === 'circle' ? 'ring-icon-muted/60' : 'ring-border'),
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          <Check size={12} strokeWidth={3} aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1 text-body text-ink-700">{children}</div>
      </div>
      {error ? (
        <p role="alert" className="pl-8 text-caption text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
