import { Check, Info, Target, TrendingUp } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'
import {
  SUBSCRIBE_FLUCTUATION_HELP,
  SUBSCRIBE_NOTE,
  clearPriceSubscription,
  defaultTargetPrice,
  getLivePrice,
  quoteByCode,
  readPriceSubscription,
  targetPricePresets,
  writePriceSubscription,
} from '@/mocks/market'

import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { Chip } from './Chip'
import { ConfirmDialog } from './ConfirmDialog'
import { TextLink } from './TextLink'

type Step = 'intro' | 'target' | 'success'

/**
 * 金价订阅提醒：一步订阅（涨跌提醒 + 目标金价），不再暴露多商品、推送时机等复杂设置。
 * - intro：说明与目标价入口 → 开启订阅
 * - target：金额键盘修改目标价
 * - success：订阅成功回执
 */
export function PriceSubscribeSheet({
  open,
  onClose,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  onChanged?: () => void
}) {
  const quote = quoteByCode('au9999')!
  const price = getLivePrice(quote.code)
  const priceRef = useRef(price)
  priceRef.current = price

  const [step, setStep] = useState<Step>('intro')
  const [enabled, setEnabled] = useState(false)
  const [targetPrice, setTargetPrice] = useState(() => defaultTargetPrice(price))
  const [input, setInput] = useState(() => defaultTargetPrice(price).toFixed(2))
  const [helpOpen, setHelpOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const saved = readPriceSubscription()
    const next = saved?.targetPrice ?? defaultTargetPrice(priceRef.current)
    setEnabled(Boolean(saved))
    setTargetPrice(next)
    setInput(next.toFixed(2))
    setStep('intro')
    setHelpOpen(false)
    setCancelOpen(false)
  }, [open])

  const parsed = Number(input)
  const valid = Number.isFinite(parsed) && parsed > 0
  const diffPct = price > 0 ? ((parsed - price) / price) * 100 : 0
  const presets = targetPricePresets(price)
  const [intPart, decPart] = (valid ? parsed.toFixed(2) : '0.00').split('.')

  const appendKey = (key: string) => {
    setInput((prev) => {
      if (key === '.') return prev.includes('.') ? prev : `${prev || '0'}.`
      if (key === '00') return prev === '' || prev === '0' ? prev : `${prev}00`
      if (prev.includes('.')) {
        const [, decimal] = prev.split('.')
        if (decimal.length >= 2) return prev
        return prev + key
      }
      if (prev.replace('.', '').length >= 6) return prev
      return prev === '0' ? key : prev + key
    })
  }

  const backspace = () => {
    setInput((prev) => (prev.length <= 1 ? '' : prev.slice(0, -1)))
  }

  const confirmTarget = () => {
    if (!valid) return
    setTargetPrice(parsed)
    /** 已订阅状态下修改目标价即时生效，无需再点保存 */
    if (enabled) {
      writePriceSubscription({ targetPrice: parsed, productCode: quote.code })
      onChanged?.()
    }
    setStep('intro')
  }

  const subscribe = () => {
    writePriceSubscription({ targetPrice, productCode: quote.code })
    setEnabled(true)
    onChanged?.()
    setStep('success')
  }

  const unsubscribe = () => {
    clearPriceSubscription()
    setEnabled(false)
    onChanged?.()
    onClose()
  }

  const title =
    step === 'target'
      ? '修改目标金价'
      : step === 'success'
        ? '订阅成功'
        : enabled
          ? '已开启金价提醒'
          : '订阅金价 关键行情不错过'
  const subtitle =
    step === 'success' || (step === 'intro' && enabled)
      ? undefined
      : `当前金价 ${price.toFixed(2)} 元/克`

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      onBack={step === 'target' ? () => setStep('intro') : undefined}
      footer={
        step === 'target' ? undefined : step === 'success' ? (
          <Button className="w-full" onClick={onClose}>
            好的
          </Button>
        ) : enabled ? (
          <div className="text-center">
            <TextLink onClick={() => setCancelOpen(true)} tone="muted">
              取消订阅
            </TextLink>
          </div>
        ) : (
          <div className="space-y-2">
            <Button className="w-full" onClick={subscribe}>
              开启订阅提醒
            </Button>
            <p className="text-center text-caption text-subtle-foreground">{SUBSCRIBE_NOTE}</p>
          </div>
        )
      }
    >
      {step === 'intro' ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg p-3 ring-1 ring-border-subtle">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gold-50 text-gold-700">
              <TrendingUp size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-body-strong text-foreground">智能涨跌提醒</span>
                <button
                  type="button"
                  onClick={() => setHelpOpen((value) => !value)}
                  aria-label="涨跌提醒说明"
                  aria-expanded={helpOpen}
                  className="inline-flex text-subtle-foreground transition active:opacity-60"
                >
                  <Info size={12} aria-hidden="true" />
                </button>
              </div>
              <p className="mt-0.5 text-caption text-subtle-foreground">基于平台策略智能触发</p>
              {helpOpen ? (
                <p className="mt-1 text-caption text-subtle-foreground">
                  {SUBSCRIBE_FLUCTUATION_HELP}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg p-3 ring-1 ring-border-subtle">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gold-50 text-gold-700">
              <Target size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body-strong text-foreground">目标金价提醒</p>
              <p className="mt-0.5 text-caption text-subtle-foreground">
                金价到达你的目标价时推送通知
              </p>
              <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-surface-2 px-3 py-2">
                <span className="text-caption text-subtle-foreground">目标金价</span>
                <span className="flex items-baseline gap-1">
                  <span className="tabular text-body-strong text-gold-700">
                    {targetPrice.toFixed(2)}
                  </span>
                  <span className="text-caption text-subtle-foreground">元/克</span>
                  <TextLink onClick={() => setStep('target')} tone="primary" inline>
                    修改
                  </TextLink>
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {step === 'target' ? (
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline text-foreground">
              <span className="text-title">¥</span>
              <span className="tabular text-display">{intPart}</span>
              <span className="tabular text-title">.{decPart}</span>
              <span className="ml-0.5 h-7 w-0.5 rounded-sm bg-primary" aria-hidden="true" />
            </div>
            <p className="shrink-0 pb-1 text-caption text-subtle-foreground">
              比当前金价
              <span
                className={cn(
                  'ml-1 tabular',
                  valid && diffPct >= 0 ? 'text-price' : 'text-success',
                )}
              >
                {valid ? `${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(2)}%` : '--'}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {presets.map((preset) => (
              <Chip
                key={preset}
                active={valid && Math.abs(parsed - preset) < 0.005}
                onClick={() => setInput(preset.toFixed(2))}
                className="h-8 justify-center"
              >
                {preset}
              </Chip>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-px overflow-hidden rounded-md bg-border-subtle">
            {['1', '2', '3'].map((key) => (
              <KeypadKey key={key} onClick={() => appendKey(key)}>
                {key}
              </KeypadKey>
            ))}
            <KeypadKey onClick={backspace} aria-label="退格">
              ⌫
            </KeypadKey>
            {['4', '5', '6'].map((key) => (
              <KeypadKey key={key} onClick={() => appendKey(key)}>
                {key}
              </KeypadKey>
            ))}
            <button
              type="button"
              onClick={confirmTarget}
              disabled={!valid}
              className="row-span-3 bg-primary text-body-strong text-primary-foreground transition active:bg-primary-active disabled:opacity-40"
            >
              确定
            </button>
            {['7', '8', '9'].map((key) => (
              <KeypadKey key={key} onClick={() => appendKey(key)}>
                {key}
              </KeypadKey>
            ))}
            {['.', '0', '00'].map((key) => (
              <KeypadKey key={key} onClick={() => appendKey(key)}>
                {key}
              </KeypadKey>
            ))}
          </div>
        </div>
      ) : null}

      {step === 'success' ? (
        <div className="space-y-2 py-2 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground">
            <Check size={28} aria-hidden="true" />
          </span>
          <p className="pt-1 text-body-strong text-foreground">订阅成功</p>
          <p className="text-caption text-subtle-foreground">
            后续将通过微信的「服务通知」提醒你。
          </p>
        </div>
      ) : null}

      <ConfirmDialog
        open={cancelOpen}
        title="取消订阅"
        description="取消后将无法收到消息通知，确认要取消订阅吗？"
        cancelText="暂不取消"
        confirmText="取消订阅"
        tone="danger"
        onConfirm={() => {
          setCancelOpen(false)
          unsubscribe()
        }}
        onClose={() => setCancelOpen(false)}
      />
    </BottomSheet>
  )
}

function KeypadKey({
  children,
  onClick,
  ...props
}: {
  children: ReactNode
  onClick: () => void
  'aria-label'?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 bg-card text-title text-foreground transition active:bg-surface-2"
      {...props}
    >
      {children}
    </button>
  )
}
