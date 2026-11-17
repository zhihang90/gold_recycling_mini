import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

/**
 * 轻量浮层提示：深墨底白字、居中、无遮罩、不拦截点击。
 * 挂载到演示设备框内（[data-phone-frame]），PC 评审时不会飘到框外；
 * 只用于「操作已发生」的即时反馈（如发送验证码成功、未勾选协议），
 * 表单错误仍应留在字段附近。duration 后自动消失，也可由父级提前关闭。
 */
export function Toast({
  open,
  message,
  onClose,
  duration = 2000,
  className,
}: {
  open: boolean
  message: string
  onClose: () => void
  duration?: number
  className?: string
}) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setHost(document.querySelector<HTMLElement>('[data-phone-frame]'))
  }, [])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => closeRef.current(), duration)
    return () => clearTimeout(timer)
  }, [open, duration])

  if (!open || !host) return null

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center px-10"
    >
      <div
        className={cn(
          'animate-in fade-in zoom-in-95 max-w-full rounded-lg bg-ink-900/90 px-4 py-2.5 text-center text-body text-paper shadow-lg duration-150',
          className,
        )}
      >
        {message}
      </div>
    </div>,
    host,
  )
}
