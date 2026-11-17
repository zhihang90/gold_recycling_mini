import { cn } from '@/lib/utils'

export type PriceSize = 'display' | 'title' | 'section' | 'card-title' | 'body'
export type PriceTone = 'ink' | 'price' | 'gold' | 'muted'

const SIZE: Record<PriceSize, { int: string; symbol: string }> = {
  display: { int: 'text-display', symbol: 'text-section' },
  title: { int: 'text-title', symbol: 'text-card-title' },
  section: { int: 'text-section', symbol: 'text-body' },
  'card-title': { int: 'text-card-title', symbol: 'text-label' },
  body: { int: 'text-body-strong', symbol: 'text-caption' },
}

const TONE: Record<PriceTone, string> = {
  ink: 'text-ink-900',
  price: 'text-price',
  gold: 'text-gold-700',
  muted: 'text-ink-500',
}

/**
 * 金额 / 金价 / 克重排版。
 * - 整数位取语义字号 role，小数固定 12 号，符号降 1–2 档，整体 tabular 对齐
 * - tone=price 只落在白卡或浅底；结算类金额用 ink，金价与克重用 gold
 */
export function PriceText({
  value,
  prefix = '¥',
  suffix,
  size = 'section',
  tone = 'ink',
  decimals = 2,
  className,
}: {
  value: number | string
  prefix?: string
  suffix?: string
  size?: PriceSize
  tone?: PriceTone
  decimals?: number
  className?: string
}) {
  const text =
    typeof value === 'number'
      ? value.toLocaleString('zh-CN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : value

  const [integer, decimal] = text.split('.')

  return (
    <span className={cn('inline-flex items-baseline tabular', TONE[tone], className)}>
      {prefix ? (
        <span className={cn('mr-1 shrink-0', SIZE[size].symbol)}>{prefix}</span>
      ) : null}
      <span className={SIZE[size].int}>{integer}</span>
      {decimal ? <span className="text-caption">.{decimal}</span> : null}
      {suffix ? (
        <span className="ml-1 shrink-0 text-caption text-muted-foreground">{suffix}</span>
      ) : null}
    </span>
  )
}
