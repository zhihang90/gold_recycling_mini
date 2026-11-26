import { useId, useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useLiveGoldPrice } from '@/hooks/useLiveGoldPrice'
import { goldTrendSeries, TREND_RANGES } from '@/mocks/goldTrend'
import type { TrendRangeKey } from '@/mocks/goldTrend'
import { quoteByCode, quoteChange } from '@/mocks/market'
import { paths } from '@/routes/paths'

import { Button } from './Button'
import { Card } from './Card'
import { Chip } from './Chip'

const signed = (value: number) => `${value >= 0 ? '+' : '-'}${Math.abs(value).toFixed(2)}`

/**
 * 首页金价走势卡：上金所实时价 + 当日涨跌 + 区间涨幅 + 走势图 + 区间页签。
 * 主价格与全站共用一个报价节拍，走势图按区间取稳定伪随机序列。
 */
export function GoldTrendCard() {
  const navigate = useNavigate()
  const price = useLiveGoldPrice()
  const [range, setRange] = useState<TrendRangeKey>('half')
  const gradientId = useId()

  const live = quoteChange(quoteByCode('au9999')!)
  const series = useMemo(() => goldTrendSeries(range), [range])
  const activeRange = TREND_RANGES.find((item) => item.key === range)!

  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' })

  const values = series.points.map((point) => point.price)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  // 上下各留 12% 余量，给高低点标签留出空间
  const top = max + span * 0.12
  const bottom = min - span * 0.12
  const domain = top - bottom
  const yOf = (value: number) => ((top - value) / domain) * 100
  const xOf = (index: number) => (index / Math.max(1, series.points.length - 1)) * 100
  const linePath = series.points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${xOf(index).toFixed(2)} ${yOf(point.price).toFixed(2)}`,
    )
    .join(' ')
  const areaPath = `${linePath} L100 100 L0 100 Z`
  const ticks = Array.from({ length: 5 }, (_, index) => top - (domain / 4) * index)
  const middle = series.points[Math.floor(series.points.length / 2)]

  const markerOf = (point: { price: number }, index: number) => ({
    left: `${Math.min(88, Math.max(12, xOf(index)))}%`,
    top: `${yOf(point.price)}%`,
  })
  const highIndex = series.points.indexOf(series.high)
  const lowIndex = series.points.indexOf(series.low)

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h2 className="text-card-title text-foreground">上金所金价(元/克)</h2>
            <Info
              size={13}
              aria-label="上海黄金交易所 Au99.99 实时报价，仅供参考"
              className="shrink-0 text-subtle-foreground"
            />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-display tabular text-gold-900">{price.toFixed(2)}</span>
            <span className="text-caption text-subtle-foreground">元/克</span>
          </div>
        </div>
        <Button size="sm" className="mt-1" onClick={() => navigate(paths.buy)}>
          买金条
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-micro tabular">
        <span className="text-subtle-foreground">{today}</span>
        <span className={live.change >= 0 ? 'text-price' : 'text-success'}>
          {signed(live.change)}
        </span>
        <span className={live.changePct >= 0 ? 'text-price' : 'text-success'}>
          {signed(live.changePct)}%
        </span>
        <span className="text-subtle-foreground">
          {activeRange.label}涨幅：
          <span className={series.changePct >= 0 ? 'text-price' : 'text-success'}>
            {signed(series.changePct)}%
          </span>
        </span>
      </div>

      <div className="flex gap-2">
        <div className="flex w-9 shrink-0 flex-col justify-between py-0.5 text-right text-micro tabular text-subtle-foreground">
          {ticks.map((tick) => (
            <span key={tick}>{tick.toFixed(2)}</span>
          ))}
        </div>

        <div className="relative h-24 flex-1">
          {ticks.map((tick, index) => (
            <span
              key={tick}
              aria-hidden="true"
              className="absolute inset-x-0 border-t border-dashed border-line-soft"
              style={{ top: `${(index / 4) * 100}%` }}
            />
          ))}

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#${gradientId})`} className="text-gold-500" />
            <path
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              className="text-gold-600"
            />
          </svg>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+3px)] rounded-sm bg-price px-1 py-0.5 text-micro tabular text-primary-foreground shadow-xs"
            style={markerOf(series.high, highIndex)}
          >
            {series.high.price.toFixed(2)}
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute z-10 mt-1 -translate-x-1/2 rounded-sm bg-success px-1 py-0.5 text-micro tabular text-success-foreground shadow-xs"
            style={markerOf(series.low, lowIndex)}
          >
            {series.low.price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex justify-between pl-11 text-micro tabular text-subtle-foreground">
        <span>{series.points[0]?.label}</span>
        <span>{middle?.label}</span>
        <span>{series.points[series.points.length - 1]?.label}</span>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {TREND_RANGES.map((item) => (
          <Chip
            key={item.key}
            active={item.key === range}
            onClick={() => setRange(item.key)}
            className="h-7 justify-center px-0 text-caption"
          >
            {item.label}
          </Chip>
        ))}
      </div>
    </Card>
  )
}
