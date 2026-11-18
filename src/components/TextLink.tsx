import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * 行内文字动作：查看全部、协议链接等不需要按钮外观的入口。
 * 默认点击区至少 44 高；inline 用于嵌在段落里的协议链接，不撑高行。
 * 颜色只取语义色，页面不再覆盖 Button 的颜色。
 */
export function TextLink({
  children,
  onClick,
  tone = 'muted',
  inline = false,
  showArrow = false,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  tone?: 'muted' | 'primary' | 'link'
  inline?: boolean
  showArrow?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-body transition',
        inline ? 'inline p-0 align-baseline' : 'inline-flex min-h-11 items-center gap-1',
        tone === 'muted' && 'text-muted-foreground active:text-foreground',
        tone === 'primary' && 'text-primary active:text-primary-active',
        tone === 'link' && 'text-link active:text-link-active',
        className,
      )}
    >
      {children}
      {showArrow ? <ChevronRight size={16} className="shrink-0 text-icon-muted" /> : null}
    </button>
  )
}
