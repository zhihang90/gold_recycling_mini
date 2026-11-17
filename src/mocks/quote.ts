import { STORAGE_KEYS } from "./keys"
import { readSession, removeSession, writeSession } from './storage'
/** 参考金价：来源与更新时间缺一不可，页面不得只展示数字 */
export const GOLD_RATE = {
  price: 586,
  source: '上海黄金交易所 Au99.99',
  updatedAt: '今天 10:30',
  status: 'live' as const,
}
export interface QuoteCategoryOption {
  value: string
  label: string
  description: string
}
/** P-02 / P-03 只开放两类；P-08 另行提供不支持品类用于拦截演示 */
export const QUOTE_CATEGORIES: QuoteCategoryOption[] = [
  {
    value: 'jewelry',
    label: '足金首饰',
    description: '项链、手镯、戒指、吊坠等足金饰品',
  },
  {
    value: 'bar',
    label: '投资金条 / 金币',
    description: '银行或品牌投资金条、投资金币',
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
]
/** 与运保费规则共用一份口径：省内 18 元、省外 23 元、保价费 0.1% */
export const SHIPPING_FEE = 18
export const SHIPPING_FEE_OUTSIDE = 23
export const INSURANCE_RATE = 0.001
export interface QuoteInput {
  category: string
  weight: string
  purity: string
  quantity: number
}
export interface QuoteBreakdown {
  price: number
  purityLabel: string
  purityFactor: number
  weight: number
  quantity: number
  estimatedValue: number
  shippingFee: number
  insuranceFee: number
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
  if (!QUOTE_CATEGORIES.some((item) => item.value === input.category)) return null
  const weight = Number(input.weight)
  const purity = PURITY_OPTIONS.find((item) => item.value === input.purity)
  if (!purity || !Number.isFinite(weight) || weight <= 0 || weight > 1000) return null
  const quantity = Number.isFinite(input.quantity)
    ? Math.max(1, Math.round(input.quantity))
    : 1
  const estimatedValue = round2(GOLD_RATE.price * purity.factor * weight * quantity)
  const insuranceFee = round2(estimatedValue * INSURANCE_RATE)
  return {
    price: GOLD_RATE.price,
    purityLabel: purity.label,
    purityFactor: purity.factor,
    weight,
    quantity,
    estimatedValue,
    shippingFee: SHIPPING_FEE,
    insuranceFee,
    payable: round2(estimatedValue - SHIPPING_FEE - insuranceFee),
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
/** 演示直达：?demo=quote 用固定输入即时计算，不写入本地存储 */
export const DEMO_QUOTE_INPUT: QuoteInput = {
  category: 'jewelry',
  weight: '12.5',
  purity: '999',
  quantity: 1,
}
export function demoQuoteSnapshot(): QuoteSnapshot | null {
  const breakdown = calculateQuote(DEMO_QUOTE_INPUT)
  if (!breakdown) return null
  return { input: DEMO_QUOTE_INPUT, breakdown, createdAt: 0 }
}
export function clearQuoteSnapshot() {
  removeSession(STORAGE_KEYS.QUOTE_SNAPSHOT)
}
export function formatClock(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `今天 ${hours}:${minutes}`
}
