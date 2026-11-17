import { PriceText } from '@/components'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { Delete, Loader2, X } from 'lucide-react'

import { useDialogGuard } from '@/lib/useDialogGuard'
import { cn } from '@/lib/utils'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const

/**
 * 支付密码弹层：模拟微信支付密码面板（仅本地原型，不发真实支付请求）。
 * - 6 位密码输入完成 → 短暂「支付中」→ onPaid
 * - 关闭（遮罩 / Esc / 返回）与滚动锁、焦点归还全部走 useDialogGuard
 * - 支付中禁止关闭，避免中途打断
 */
export function PaymentPasswordSheet({
  open,
  amount,
  channel = '微信支付',
  onClose,
  onPaid,
}: {
  open: boolean
  amount: number
  /** 支付渠道名称：跟随确认订单页选择的方式 */
  channel?: string
  onClose: () => void
  onPaid: () => void
}) {
  const [digits, setDigits] = useState('')
  const [paying, setPaying] = useState(false)
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const paidRef = useRef(false)
  const onPaidRef = useRef(onPaid)
  onPaidRef.current = onPaid

  const handleClose = () => {
    if (!paying) onClose()
  }

  // 滚动锁 + Esc + popstate + focus 归还
  useDialogGuard({ open, onClose: handleClose, panelRef, historyKey: '__pay' })

  // 每次打开重置输入；关闭后延迟卸载以播完退场动效
  useEffect(() => {
    if (open) {
      setDigits('')
      setPaying(false)
      paidRef.current = false
      setMounted(true)
      const frame = window.requestAnimationFrame(() => setShown(true))
      return () => window.cancelAnimationFrame(frame)
    }
    setShown(false)
    const timer = window.setTimeout(() => setMounted(false), 240)
    return () => window.clearTimeout(timer)
  }, [open])

  // 物理键盘输入（桌面浏览器调试用）
  useEffect(() => {
    if (!open || paying) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (/^\d$/.test(event.key)) {
        setDigits((prev) => (prev.length >= 6 ? prev : prev + event.key))
      } else if (event.key === 'Backspace') {
        setDigits((prev) => prev.slice(0, -1))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, paying])

  // 输入满 6 位：进入支付中，短暂停留后回调页面
  useEffect(() => {
    if (!open || digits.length !== 6 || paidRef.current) return
    paidRef.current = true
    setPaying(true)
    const timer = window.setTimeout(() => onPaidRef.current(), 700)
    return () => window.clearTimeout(timer)
  }, [digits, open])

  if (!mounted) return null

  const content = (
    <div className="absolute inset-0 z-50">
      <div
        onClick={handleClose}
        className={cn(
          'absolute inset-0 bg-overlay transition-opacity duration-[var(--motion-base)] ease-[var(--ease-standard)]',
          shown ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="请输入支付密码"
        tabIndex={-1}
        className={cn(
          'absolute inset-x-0 bottom-0 overflow-hidden rounded-t-lg bg-card shadow-lg outline-none',
          'transition-transform duration-[var(--motion-base)]',
          shown ? 'translate-y-0 ease-[var(--ease-enter)]' : 'translate-y-full ease-[var(--ease-exit)]',
        )}
      >
        <div className="flex h-12 items-center justify-between border-b border-border-subtle px-4">
          <span className="text-body-strong text-foreground">{channel}</span>
          <button
            type="button"
            onClick={handleClose}
            disabled={paying}
            aria-label="关闭"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition active:bg-surface-2 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pt-5 pb-4">
          <p className="text-body text-muted-foreground">请输入支付密码</p>
          <div className="mt-1">
            <PriceText value={amount} size="title" tone="ink" />
          </div>

          <div className="mt-5 flex h-11 overflow-hidden rounded-md ring-1 ring-border">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'flex flex-1 items-center justify-center border-border-subtle',
                  i < 5 && 'border-r',
                  i === digits.length && !paying && 'bg-surface-2',
                )}
              >
                {i < digits.length ? <span className="h-2 w-2 rounded-full bg-foreground" /> : null}
              </div>
            ))}
          </div>
        </div>

        {paying ? (
          <div className="flex h-48 items-center justify-center gap-2 border-t border-border-subtle text-body text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            支付中…
          </div>
        ) : (
          <div className="grid grid-cols-3 pb-[env(safe-area-inset-bottom)]">
            {KEYS.map((key, i) => {
              const isLastCol = i % 3 === 2
              const isLastRow = i >= 9
              if (!key) {
                return (
                  <div
                    key={i}
                    className={cn(
                      'h-12',
                      !isLastCol && 'border-r border-border-subtle',
                      !isLastRow && 'border-b border-border-subtle',
                    )}
                  />
                )
              }
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={key === 'del' ? '删除' : key}
                  onClick={() => {
                    if (key === 'del') setDigits((prev) => prev.slice(0, -1))
                    else setDigits((prev) => (prev.length >= 6 ? prev : prev + key))
                  }}
                  className={cn(
                    'flex h-12 items-center justify-center text-section text-foreground transition active:bg-surface-2',
                    !isLastCol && 'border-r border-border-subtle',
                    !isLastRow && 'border-b border-border-subtle',
                  )}
                >
                  {key === 'del' ? <Delete size={22} /> : key}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  const host = document.querySelector('[data-phone-frame]')
  return host ? createPortal(content, host) : content
}
