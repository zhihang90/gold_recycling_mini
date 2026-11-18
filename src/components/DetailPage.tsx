import type { ReactNode } from 'react'
import { PageShell } from './PageShell'
import { PageHeader } from './PageHeader'
import { BottomActionBar } from './BottomActionBar'
import { cn } from '@/lib/utils'

/**
 * 二级页模板：带返回键与标题，可选吸底操作栏。
 * 布局：外层定高、页头与吸底栏固定在滚动区之外，只有中间内容滚动，
 * 因此 footer 永远贴在屏幕底部，不会随页面滚动。
 * footer 只放操作按钮；吸底栏已处理安全区，页面不要自己写 position: fixed。
 */
export function DetailPage({
  title,
  right,
  onBack,
  footer,
  stickyBar,
  padded = true,
  header = true,
  children,
  className,
  contentClassName,
}: {
  title?: string
  right?: ReactNode
  onBack?: () => void
  footer?: ReactNode
  /** 吸顶横幅：进滚动区但贴在页头下方，用于订单进度这类常驻信息 */
  stickyBar?: ReactNode
  padded?: boolean
  /** 登录等无返回路径的入口页可整块去掉标题栏。 */
  header?: boolean
  children?: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <PageShell padded={false} className={cn('h-full overflow-hidden', className)}>
      {header ? <PageHeader title={title} right={right} onBack={onBack} /> : null}
      <div
        data-page-scroll
        className="hide-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
      >
        {stickyBar ? (
          <div className="sticky top-0 z-20 shrink-0 border-b border-border-subtle bg-card/95 backdrop-blur">
            {stickyBar}
          </div>
        ) : null}
        <div className={cn('flex-1', padded && 'space-y-4 px-4 pt-4 pb-6', contentClassName)}>
          {children}
        </div>
      </div>
      {footer ? <BottomActionBar>{footer}</BottomActionBar> : null}
    </PageShell>
  )
}
