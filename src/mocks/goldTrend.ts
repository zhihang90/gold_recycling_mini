import { getLivePrice } from './market'

/** 首页金价走势卡的区间页签 */
export type TrendRangeKey = 'realtime' | 'month' | 'quarter' | 'half' | 'year'

export const TREND_RANGES: { key: TrendRangeKey; label: string }[] = [
  { key: 'realtime', label: '实时' },
  { key: 'month', label: '近一月' },
  { key: 'quarter', label: '近三月' },
  { key: 'half', label: '近半年' },
  { key: 'year', label: '近一年' },
]

export interface TrendPoint {
  label: string
  price: number
}

export interface GoldTrendSeries {
  points: TrendPoint[]
  /** 区间内最高 / 最低点，图上打标用 */
  high: TrendPoint
  low: TrendPoint
  /** 区间涨跌幅（%），末点相对首点 */
  changePct: number
}

interface RangeConfig {
  count: number
  /** 区间起点相对当前金价的倍数，制造各区间不同的涨跌故事 */
  startFactor: number
  /** 单点最大波动幅度（相对金价） */
  noise: number
  /** 每点趋势项，负值表示缓慢回落 */
  drift: number
  seed: number
  /** 相邻点间隔天数；0 表示当日分时 */
  stepDays: number
}

const RANGE_CONFIG: Record<TrendRangeKey, RangeConfig> = {
  realtime: { count: 13, startFactor: 1, noise: 0.0012, drift: 0, seed: 11, stepDays: 0 },
  month: { count: 30, startFactor: 1.03, noise: 0.005, drift: -0.0006, seed: 23, stepDays: 1 },
  quarter: { count: 90, startFactor: 1.06, noise: 0.006, drift: -0.0005, seed: 37, stepDays: 1 },
  half: { count: 132, startFactor: 1.1, noise: 0.007, drift: -0.0004, seed: 53, stepDays: 1 },
  year: { count: 52, startFactor: 1.12, noise: 0.011, drift: -0.0024, seed: 71, stepDays: 7 },
}

/** 固定种子的伪随机：同一区间每次渲染走势一致，不随刷新跳动 */
function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const pad = (value: number) => String(value).padStart(2, '0')

function dateLabel(offsetDays: number) {
  const date = new Date()
  date.setDate(date.getDate() - offsetDays)
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function minutesLabel(offsetSteps: number, slotMinutes: number) {
  const total = 9 * 60 + offsetSteps * slotMinutes
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

/**
 * 生成某个区间的走势：以当前上金所金价为锚点倒推，
 * 末点对齐实时金价，避免图表末端与卡片主价格脱节。
 */
export function goldTrendSeries(range: TrendRangeKey): GoldTrendSeries {
  const config = RANGE_CONFIG[range]
  const base = getLivePrice('au9999')
  const random = mulberry32(config.seed)

  const raw: number[] = []
  let price = base * config.startFactor
  for (let index = 0; index < config.count; index += 1) {
    price = price * (1 + config.drift + (random() - 0.5) * config.noise)
    raw.push(price)
  }

  // 逐点向当前金价收敛，保证末点等于实时价且曲线平滑
  const last = raw[raw.length - 1] ?? base
  const points: TrendPoint[] = raw.map((value, index) => {
    const ratio = index / Math.max(1, raw.length - 1)
    const aligned = value * (base / last) ** ratio
    const label =
      config.stepDays === 0
        ? minutesLabel(index, 30)
        : dateLabel((raw.length - 1 - index) * config.stepDays)
    return { label, price: Math.round(aligned * 100) / 100 }
  })

  const high = points.reduce((best, point) => (point.price > best.price ? point : best), points[0])
  const low = points.reduce((best, point) => (point.price < best.price ? point : best), points[0])
  const first = points[0].price
  const lastPrice = points[points.length - 1].price
  const changePct = first ? Math.round(((lastPrice - first) / first) * 10000) / 100 : 0

  return { points, high, low, changePct }
}
