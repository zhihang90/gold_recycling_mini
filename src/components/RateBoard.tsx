import { useId, useMemo, useState } from 'react'
import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { round2 } from '@/lib/money'
import { Button } from './Button'
import { Card } from './Card'
import { Chip, ChipRow } from './Chip'
import { PriceText } from './PriceText'
import { SegmentedTabs } from './SegmentedTabs'

export interface RateBoardPoint {
  label: string
  price: number
}

export interface RateBoardSeries {
  key: string
  label: string
  /** 区间说明：采样口径写在图下，避免横轴只给两个时间点造成误读 */
  caption: string
  points: RateBoardPoint[]
}

type BoardTab = 'live' | 'trend'

const TABS = [
  { value: 'live', label: '实时金价' },
  { value: 'trend', label: '金价走势' },
]

/**
 * 金价看板：看价与看势在同一张卡里完成。
 * - 实时页只留「价 + 出处 + 行动」，行动分主次：回收为主、买金为次
 * - 走势页保留区间涨跌、最高 / 最低基准线与采样口径
 * - 两个 tab 等高，切换不跳动
 */
export function RateBoard({
  price,
  source,
  updatedAt,
  series,
  onRecover,
  recoverLabel = '立即回收',
  onBuy,
  buyLabel = '我要买投资金',
  className,
}: {
  price: number
  source: string
  updatedAt: string
  series: RateBoardSeries[]
  onRecover?: () => void
  recoverLabel?: string
  /** 次要入口：跳转买金，不传则不展示 */
  onBuy?: () => void
  buyLabel?: string
  className?: string
}) {
  const [tab, setTab] = useState<BoardTab>('live')
  const defaultSeries = series[0]
  const [seriesKey, setSeriesKey] = useState(defaultSeries?.key ?? '')

  const active = series.find((item) => item.key === seriesKey) ?? defaultSeries
  const trend = useMemo(() => summarize(active?.points ?? []), [active])

  if (!defaultSeries) return null

  return (
    <Card padding="none" className={cn('overflow-hidden', className)}>
      <SegmentedTabs
        items={TABS}
        value={tab}
        onChange={(value) => setTab(value as BoardTab)}
        variant="underline"
      />

      <div className="flex min-h-52 flex-col px-4 pb-4 pt-5">
        {tab === 'live' ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <PriceText value={price} size="display" tone="gold" suffix="元/克" />

            <Button size="lg" block onClick={onRecover}>
              {recoverLabel}
            </Button>

            {onBuy ? (
              <button
                type="button"
                onClick={onBuy}
                className="flex min-h-11 w-full items-center justify-center gap-1 text-body-strong text-primary transition active:text-primary-active"
              >
                {buyLabel}
                <ChevronRight size={16} strokeWidth={2.4} className="shrink-0" aria-hidden="true" />
              </button>
            ) : null}

            <p className="text-caption text-subtle-foreground">数据参考{source}</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-label text-muted-foreground">{active?.label}</span>
                <Change value={trend.change} rate={trend.changeRate} compact />
              </div>
              <span className="text-caption text-subtle-foreground tabular">
                当前 {trend.current.toFixed(2)}
              </span>
            </div>

            <Sparkline points={active?.points ?? []} />

            <ChipRow>
              {series.map((item) => (
                <Chip
                  key={item.key}
                  active={item.key === active?.key}
                  onClick={() => setSeriesKey(item.key)}
                >
                  {item.label}
                </Chip>
              ))}
            </ChipRow>

            <p className="truncate text-caption text-subtle-foreground tabular">
              数据参考{source} · 更新于 {updatedAt}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

function Change({
  value,
  rate,
  compact = false,
}: {
  value: number
  rate: number
  compact?: boolean
}) {
  const up = value >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span
      className={cn(
        'flex items-center gap-1 tabular',
        compact ? 'text-caption' : 'text-body-strong',
        up ? 'text-price' : 'text-success',
      )}
    >
      <Icon size={compact ? 14 : 16} strokeWidth={2.2} aria-hidden />
      <span>
        {up ? '+' : '−'}
        {Math.abs(value).toFixed(2)}
      </span>
      <span className={compact ? 'text-caption' : 'text-label'}>
        ({up ? '+' : '−'}
        {Math.abs(rate).toFixed(2)}%)
      </span>
    </span>
  )
}

/** 折线用百分比坐标铺满容器，配合 non-scaling-stroke 保证细线不被拉伸 */
function Sparkline({ points }: { points: RateBoardPoint[] }) {
  const gradientId = useId()
  const values = points.map((point) => point.price)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1

  const coords = values.map((value, index) => {
    const x = 1 + (index / Math.max(1, values.length - 1)) * 98
    const y = ((max - value) / span) * 100
    return { x, y }
  })

  const line = coords.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join(' ')
  const area = `${line} L${coords[coords.length - 1].x} 100 L${coords[0].x} 100 Z`
  const first = points[0]
  const last = points[points.length - 1]

  return (
    <figure className="space-y-1.5">
      <div className="flex gap-2">
        <div
          className="relative h-20 flex-1 text-gold-600"
          role="img"
          aria-label={`金价走势，${first.label} ${first.price.toFixed(2)} 元，${last.label} ${last.price.toFixed(2)} 元，区间最高 ${max.toFixed(2)}，最低 ${min.toFixed(2)}`}
        >
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-border-subtle" />
          <div className="absolute inset-x-0 bottom-0 border-t border-dashed border-border-subtle" />
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradientId})`} />
            <path
              d={line}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span
            className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-600 ring-2 ring-card"
            style={{
              left: `${coords[coords.length - 1].x}%`,
              top: `${coords[coords.length - 1].y}%`,
            }}
            aria-hidden
          />
        </div>
        <div className="flex flex-col justify-between pb-0.5 text-caption text-subtle-foreground tabular">
          <span>{max.toFixed(2)}</span>
          <span>{min.toFixed(2)}</span>
        </div>
      </div>
      <figcaption className="flex justify-between gap-3 text-caption text-subtle-foreground tabular">
        <span>{first.label}</span>
        <span>{last.label}</span>
      </figcaption>
    </figure>
  )
}

function summarize(points: RateBoardPoint[]) {
  const values = points.map((point) => point.price)
  const first = values[0] ?? 0
  const last = values[values.length - 1] ?? 0
  const change = round2(last - first)
  return {
    current: last,
    change,
    changeRate: first ? round2((change / first) * 100) : 0,
  }
}
