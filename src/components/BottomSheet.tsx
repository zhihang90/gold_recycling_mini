import { createPortal } from 'react-dom'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 底部抽屉弹层：遮罩 + 底部上滑面板。
 * - 渲染到设备框内（`[data-phone-frame]`），不覆盖桌面演示导航
 * - 打开锁定页面滚动、焦点移入面板、Esc / 遮罩 / 下滑关闭、浏览器返回关闭
 * - 动效使用 --motion-base / --ease-* token；prefers-reduced-motion 由全局 CSS 降级
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const [dragY, setDragY] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<number | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = window.requestAnimationFrame(() => setShown(true))
      return () => window.cancelAnimationFrame(frame)
    }
    setShown(false)
    const timer = window.setTimeout(() => setMounted(false), 240)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    const scrollRoot = document.querySelector('[data-phone-scroll]') as HTMLElement | null
    const prevOverflow = scrollRoot?.style.overflowY ?? ''
    if (scrollRoot) scrollRoot.style.overflowY = 'hidden'
    const previousFocus = document.activeElement as HTMLElement | null

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKeyDown)

    let pushed = false
    try {
      window.history.pushState({ ...(window.history.state ?? {}), __sheet: true }, '')
      pushed = true
    } catch {
      pushed = false
    }
    const onPop = () => onCloseRef.current()
    window.addEventListener('popstate', onPop)

    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 0)

    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('popstate', onPop)
      if (scrollRoot) scrollRoot.style.overflowY = prevOverflow
      previousFocus?.focus?.()
      if (pushed && window.history.state?.__sheet) window.history.back()
    }
  }, [open])

  if (!mounted) return null

  const host = document.querySelector('[data-phone-frame]')
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
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

  return host ? createPortal(content, host) : content
}
