import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * 吸底操作栏：回收流程的「立即估价 / 提交回收单」用它。
 * 底部必须让开 iPhone Home 指示条 —— 微信内 env(safe-area-inset-bottom) 有值，
 * 但不支持 env() 的旧内核要拿到 12px 的兜底，所以用 max()。
 */
export function BottomActionBar({
  children,
  note,
  className,
}: {
  children: ReactNode
  note?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-30 border-t border-border-subtle bg-card/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-md backdrop-blur',
        className,
      )}
    >
      {note ? <div className="pb-2 text-body text-subtle-foreground">{note}</div> : null}
      {children}
    </div>
  )
}
