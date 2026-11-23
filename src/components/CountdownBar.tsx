import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatRemaining(ms: number, format: 'clock' | 'seconds') {
  if (format === 'seconds') return `${Math.ceil(Math.max(0, ms) / 1000)}秒`

  const total = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (value: number) => String(value).padStart(2, '0')

  if (days > 0) return `${days} 天 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

/**
 * 倒计时条：终价确认窗口、签署与支付时效。
 * 每秒刷新，到点触发一次 onEnd；role=timer 且 aria-live=off，避免读屏每秒播报。
 */
export function CountdownBar({
  deadline,
  prefix = '剩余',
  text,
  format = 'clock',
  tone = 'warning',
  onEnd,
  className,
}: {
  deadline: number
  prefix?: string
  /** 自定义文案：入参为格式化后的剩余时间，可把时间嵌进整句提示中 */
  text?: (remaining: string) => ReactNode
  /** 时间格式：clock 为 HH:MM:SS，seconds 为「59秒」 */
  format?: 'clock' | 'seconds'
  tone?: 'warning' | 'danger'
  onEnd?: () => void
  className?: string
}) {
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()))
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd

  useEffect(() => {
    let timer = 0
    const tick = () => {
      const next = Math.max(0, deadline - Date.now())
      setRemaining(next)
      if (next === 0) {
        window.clearInterval(timer)
        onEndRef.current?.()
      }
    }

    tick()
    timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [deadline])

  return (
    <div
      role="timer"
      aria-live="off"
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-3 ring-1',
        tone === 'danger'
          ? 'bg-destructive/8 text-destructive ring-destructive/20'
          : 'bg-warning/8 text-warning ring-warning/20',
        className,
      )}
    >
      <Clock size={16} className="shrink-0" />
      <span className="text-body-strong">
        {text ? (
          text(formatRemaining(remaining, format))
        ) : (
          <>
            {prefix} <span className="tabular">{formatRemaining(remaining, format)}</span>
          </>
        )}
      </span>
    </div>
  )
}
