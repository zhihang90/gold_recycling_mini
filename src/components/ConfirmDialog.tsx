import { createPortal } from 'react-dom'
import { useEffect, useId, useRef } from 'react'
import { Button } from '@/components/Button'

/**
 * 居中确认框：不可逆操作与关键决策的最后一道确认。
 * 渲染到设备框内；Esc / 遮罩 / 浏览器返回关闭；打开时锁背景滚动、焦点移入面板并在关闭后归还。
 * 不做 toast、不自动跳转，确认后的状态流转由页面负责。
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '确定',
  cancelText = '取消',
  tone = 'default',
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  tone?: 'default' | 'danger'
  onConfirm: () => void
  onClose: () => void
}) {
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

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
      window.history.pushState({ ...(window.history.state ?? {}), __dialog: true }, '')
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
      if (pushed && window.history.state?.__dialog) window.history.back()
    }
  }, [open])

  if (!open) return null

  const host = document.querySelector('[data-phone-frame]')
  const content = (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />

      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className="relative w-full max-w-80 rounded-lg bg-card p-4 shadow-lg outline-none"
      >
        <h2 id={titleId} className="text-card-title text-foreground">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="mt-2 text-body text-muted-foreground">
            {description}
          </p>
        ) : null}

        <div className="mt-4 flex gap-2">
          <Button variant="secondary" block onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant="primary"
            block
            className={tone === 'danger' ? 'bg-destructive active:bg-destructive' : undefined}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )

  return host ? createPortal(content, host) : content
}
