import { createPortal } from 'react-dom'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDialogGuard } from '@/lib/useDialogGuard'

/**
 * 底部抽屉弹层：遮罩 + 底部上滑面板。
 * - 默认渲染到设备框内（`[data-phone-frame]`），不覆盖桌面演示导航；
 *   `disablePortal` 为 true 时就地渲染在调用方 DOM 中——适用于需要和同容器内其他 absolute 元素保持独立的场景
 * - 打开锁定页面滚动、焦点移入面板、Esc / 遮罩 / 下滑关闭、浏览器返回关闭
 * - 动效使用 --motion-base / --ease-* token；prefers-reduced-motion 由全局 CSS 降级
 * - 滚动容器自身滚到底部时触发 onReachBottom（支持强制阅读这类业务）
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  onReachBottom,
  extraScrollLocks,
  disablePortal = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  /** 内容滚动到底部（阈值 8px）时触发；用于强制阅读等场景 */
  onReachBottom?: () => void
  /** 额外需要锁滚动的容器（除 [data-phone-scroll] 外），适用于内层有 overflow-y-auto 的页面 */
  extraScrollLocks?: React.RefObject<HTMLElement | null>[]
  /** 为 true 时就地渲染在调用方 DOM 中，不 portal 到 [data-phone-frame]。
   *  适用于抽屉需要和同容器内的 absolute 元素（如 BottomActionBar）保持 DOM 层级解耦的场景 */
  disablePortal?: boolean
}) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const [dragY, setDragY] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const reachedRef = useRef(false)
  const onReachBottomRef = useRef(onReachBottom)
  useEffect(() => {
    onReachBottomRef.current = onReachBottom
  }, [onReachBottom])

  // 滚动锁 + Esc + popstate + focus 归还
  useDialogGuard({ open, onClose, panelRef, historyKey: '__sheet', extraScrollLocks })

  // 挂载 / 卸载 + 进场动效
  useEffect(() => {
    if (open) {
      setMounted(true)
      reachedRef.current = false
      const frame = window.requestAnimationFrame(() => setShown(true))
      return () => window.cancelAnimationFrame(frame)
    }
    setShown(false)
    const timer = window.setTimeout(() => setMounted(false), 240)
    return () => window.clearTimeout(timer)
  }, [open])

  // 滚动到底回调：只依赖 open，避免因为 onReachBottom 函数引用变化反复 cleanup/rerun 丢事件
  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (!el) return
    const handler = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 8
      if (atBottom && !reachedRef.current) {
        reachedRef.current = true
        onReachBottomRef.current?.()
      }
    }
    // 面板进场动效是 requestAnimationFrame 触发的，DOM 就位前 scrollHeight 可能不准确
    // 等 shown 一帧后再检查一次初始触底（内容短的情况）
    const frame = window.requestAnimationFrame(() => handler())
    el.addEventListener('scroll', handler, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      el.removeEventListener('scroll', handler)
    }
  }, [open])

  if (!mounted) return null

  const content = (
    <div className="absolute inset-0 z-50" aria-hidden={!open}>
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/45 transition-opacity duration-[var(--motion-base)] ease-[var(--ease-standard)]',
          shown ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{ transform: shown ? `translateY(${dragY}px)` : 'translateY(100%)' }}
        className={cn(
          'absolute inset-x-0 bottom-0 flex max-h-[80%] flex-col overflow-hidden rounded-t-lg bg-card shadow-lg outline-none',
          'transition-transform duration-[var(--motion-base)]',
          shown ? 'ease-[var(--ease-enter)]' : 'ease-[var(--ease-exit)]',
          className,
        )}
      >
        <div
          className="flex h-12 shrink-0 touch-none items-center justify-between border-b border-border-subtle px-4"
          onTouchStart={(event) => {
            dragStart.current = event.touches[0]?.clientY ?? null
          }}
          onTouchMove={(event) => {
            if (dragStart.current === null) return
            const dy = (event.touches[0]?.clientY ?? 0) - dragStart.current
            if (dy > 0) setDragY(dy)
          }}
          onTouchEnd={() => {
            if (dragY > 80) onClose()
            setDragY(0)
            dragStart.current = null
          }}
        >
          <div className="min-w-0">
            <div className="truncate text-card-title text-foreground">{title}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition active:bg-surface-2"
          >
            <X size={20} />
          </button>
        </div>

        <div ref={scrollRef} className="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-border-subtle px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )

  if (disablePortal) return content
  const host = document.querySelector('[data-phone-frame]')
  return host ? createPortal(content, host) : content
}
