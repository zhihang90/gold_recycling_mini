import { STORAGE_KEYS } from "./keys"
import { readSession, removeSession, writeSession } from './storage'

/** 参考金价：来源与更新时间缺一不可，页面不得只展示数字 */
export const GOLD_RATE = {
  price: 586,
  source: '上海黄金交易所 Au99.99',
  updatedAt: '今天 10:30',
  status: 'live' as const,
}

export interface RatePoint {
  /** 采样点标签：开盘 / 周一 / 10-20 / 1 月，用于横轴两端 */
  label: string
  price: number
}
export interface RateSeries {
  key: string
  label: string
  /** 区间说明，图下小字用 */
  caption: string
  points: RatePoint[]
}

/** 金价走势：末点与 GOLD_RATE.price 对齐，切周期只换采样密度 */
export const RATE_SERIES: RateSeries[] = [
  {
    key: 'today',
    label: '今日',
    caption: '09:00 开盘 · 每 30 分钟采样',
    points: [
      { label: '09:00', price: 583.2 },
      { label: '09:30', price: 583.8 },
      { label: '10:00', price: 584.6 },
      { label: '10:30', price: 582.6 },
      { label: '11:00', price: 584.4 },
      { label: '11:30', price: 585.9 },
      { label: '13:30', price: 585.4 },
      { label: '14:00', price: 586 },
    ],
  },
  {
    key: 'week',
    label: '近一周',
    caption: '近五个交易日',
    points: [
      { label: '周一', price: 580.4 },
      { label: '周二', price: 582.1 },
      { label: '周三', price: 581.6 },
      { label: '周四', price: 583.9 },
      { label: '周五', price: 584.8 },
      { label: '周六', price: 583.2 },
      { label: '周日', price: 586 },
    ],
  },
  {
    key: 'month',
    label: '近一月',
    caption: '近 30 天日线',
    points: [
      { label: '10-01', price: 573.2 },
      { label: '10-04', price: 575.8 },
      { label: '10-07', price: 574.1 },
      { label: '10-10', price: 577.6 },
      { label: '10-13', price: 576.9 },
      { label: '10-16', price: 579.4 },
      { label: '10-19', price: 581.2 },
      { label: '10-22', price: 580.1 },
      { label: '10-25', price: 583.6 },
      { label: '10-31', price: 586 },
    ],
  },
  {
    key: 'year',
    label: '近一年',
    caption: '近 1 年月线',
    points: [
      { label: '1 月', price: 512.4 },
      { label: '2 月', price: 520.1 },
      { label: '3 月', price: 531.6 },
      { label: '4 月', price: 528.2 },
      { label: '5 月', price: 540.7 },
      { label: '6 月', price: 552.3 },
      { label: '7 月', price: 548.9 },
      { label: '8 月', price: 559.4 },
      { label: '9 月', price: 566.8 },
      { label: '10 月', price: 571.5 },
      { label: '11 月', price: 586 },
    ],
  },
]

export interface QuoteCategoryOption {
  value: string
  label: string
  description: string
  /** 品类服务费率：金条 2%、金饰 4%，均按预估金价计算，不做折扣 */
  serviceFeeRate: number
  /** 品类支持的纯度选项 value 列表（bar 只开放 999/999.9） */
  purities: string[]
  /**
   * 是否支持回收。当前只开放金条与金饰，恒为 true；
   * 未来若新增暂未开放品类，可将该项置 false 以显示"敬请期待"置灰。
   */
  supported: boolean
}

/** 品类：当前仅开放金条 / 金饰两类回收 */
export const QUOTE_CATEGORIES: QuoteCategoryOption[] = [
  {
    value: 'bar',
    label: '金条',
    description: '银行或品牌投资金条、投资金币',
    serviceFeeRate: 0.02,
    purities: ['999.9', '999'],
    supported: true,
  },
  {
    value: 'jewelry',
    label: '金饰',
    description: '项链、手镯、戒指、吊坠等足金饰品',
    serviceFeeRate: 0.04,
    purities: ['999.9', '999', '990'],
    supported: true,
  },
]

export interface PurityOption {
  value: string
  label: string
  factor: number
}
export const PURITY_OPTIONS: PurityOption[] = [
  { value: '999.9', label: '足金 999.9（万足金）', factor: 0.9999 },
  { value: '999', label: '足金 999（千足金）', factor: 0.999 },
  { value: '990', label: '足金 990', factor: 0.99 },
  { value: '925', label: '925 银', factor: 0.925 },
  { value: '999.5', label: '铂金 999.5', factor: 0.9995 },
]

/** 与运保费规则共用一份口径：省内 18 元、省外 23 元、保价费 0.1% */
export const SHIPPING_FEE = 18
export const SHIPPING_FEE_OUTSIDE = 23
export const INSURANCE_RATE = 0.001
/** 满 20 克免运费 + 保险费（阅宝口径） */
export const OVER_FREE_GRAM = 20

export interface QuoteInput {
  category: string
  weight: string
  purity: string
  quantity: number
}

export interface QuoteBreakdown {
  /** 参考金价 */
  price: number
  purityLabel: string
  purityFactor: number
  weight: number
  quantity: number
  /** 总克重 = weight * quantity（用户输入×件数） */
  totalGram: number
  /** 预估总价值 = price × purityFactor × totalGram */
  estimatedValue: number
  /** 服务费率：金条 2%、金饰 4% */
  serviceFeeRate: number
  /** 每克服务费 = 参考金价 × 纯度折算 × 费率，仅用于展示 */
  serviceFeePerGram: number
  /** 服务费 = 预估总价值 × 费率 */
  serviceFee: number
  /** 是否享受满 20 克免运保 */
  over20Free: boolean
  shippingFee: number
  insuranceFee: number
  /** 最终预估回收价 = estimatedValue - serviceFee - shippingFee - insuranceFee */
  payable: number
}

export interface QuoteSnapshot {
  input: QuoteInput
  breakdown: QuoteBreakdown
  createdAt: number
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

/** 估价计算：不合法输入返回 null，由页面就地提示，不弹窗 */
export function calculateQuote(input: QuoteInput): QuoteBreakdown | null {
  const category = QUOTE_CATEGORIES.find((item) => item.value === input.category)
  if (!category || !category.supported) return null
  const purity = PURITY_OPTIONS.find(
    (item) => item.value === input.purity && category.purities.includes(input.purity),
  )
  if (!purity) return null
  const weight = Number(input.weight)
  if (!Number.isFinite(weight) || weight <= 0 || weight > 1000) return null
  const quantity = Number.isFinite(input.quantity)
    ? Math.max(1, Math.round(input.quantity))
    : 1
  const totalGram = round2(weight * quantity)
  const estimatedValue = round2(GOLD_RATE.price * purity.factor * totalGram)
  const serviceFeeRate = category.serviceFeeRate
  const serviceFeePerGram = round2(GOLD_RATE.price * purity.factor * serviceFeeRate)
  const serviceFee = round2(estimatedValue * serviceFeeRate)
  const over20Free = totalGram >= OVER_FREE_GRAM
  const shippingFee = over20Free ? 0 : SHIPPING_FEE
  const insuranceFee = over20Free ? 0 : round2(estimatedValue * INSURANCE_RATE)
  const payable = round2(estimatedValue - serviceFee - shippingFee - insuranceFee)
  return {
    price: GOLD_RATE.price,
    purityLabel: purity.label,
    purityFactor: purity.factor,
    weight,
    quantity,
    totalGram,
    estimatedValue,
    serviceFeeRate,
    serviceFeePerGram,
    serviceFee,
    over20Free,
    shippingFee,
    insuranceFee,
    payable,
  }
}

export function saveQuoteSnapshot(input: QuoteInput, breakdown: QuoteBreakdown) {
  writeSession(STORAGE_KEYS.QUOTE_SNAPSHOT, {
    input,
    breakdown,
    createdAt: Date.now(),
  } satisfies QuoteSnapshot)
}
export function readQuoteSnapshot(): QuoteSnapshot | null {
  const snapshot = readSession<QuoteSnapshot>(STORAGE_KEYS.QUOTE_SNAPSHOT)
  if (!snapshot || !snapshot.breakdown) return null
  return snapshot
}
export function clearQuoteSnapshot() {
  removeSession(STORAGE_KEYS.QUOTE_SNAPSHOT)
}
export function formatClock(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `今天 ${hours}:${minutes}`
}

/** 演示直达：?demo=quote 用固定输入即时计算，不写入本地存储 */
export const DEMO_QUOTE_INPUT: QuoteInput = {
  category: 'bar',
  weight: '10.00',
  purity: '999.9',
  quantity: 1,
}
export function demoQuoteSnapshot(): QuoteSnapshot | null {
  const breakdown = calculateQuote(DEMO_QUOTE_INPUT)
  if (!breakdown) return null
  return { input: DEMO_QUOTE_INPUT, breakdown, createdAt: 0 }
}
