import { STORAGE_KEYS } from "./keys"
import { readSession, writeSession, removeSession } from './storage'
/** checkout 存储的轻量条目：只存 id 和数量，页面加载时从 mocks 还原完整对象 */
export interface CheckoutEntry {
  productId: string
  variantId: string
  quantity: number
}
export interface CheckoutItem {
  product: import('./goldShop').GoldProduct
  variant: import('./goldShop').GoldVariant
  quantity: number
}
export function writeCheckout(entries: CheckoutEntry[]) {
  writeSession(STORAGE_KEYS.CHECKOUT, entries)
}
export function readCheckout(): CheckoutEntry[] | null {
  return readSession<CheckoutEntry[]>(STORAGE_KEYS.CHECKOUT)
}
export function clearCheckout() {
  removeSession(STORAGE_KEYS.CHECKOUT)
}

/** 提交成功后写入的结果快照：独立成功页靠它恢复金额与件数 */
export interface CheckoutResult {
  amount: number
  count: number
  createdAt: number
}

/** 结果快照有效期：超过 30 分钟视为过期，避免直达成功页看到旧订单 */
const RESULT_TTL = 30 * 60 * 1000

export function writeCheckoutResult(result: CheckoutResult) {
  writeSession(STORAGE_KEYS.CHECKOUT_RESULT, result)
}

export function readCheckoutResult(): CheckoutResult | null {
  const result = readSession<CheckoutResult>(STORAGE_KEYS.CHECKOUT_RESULT)
  if (!result) return null
  return Date.now() - result.createdAt < RESULT_TTL ? result : null
}

/**
 * 确认订单表单草稿：去添加 / 编辑收货地址后返回，备注、支付方式与协议勾选不丢。
 * 收货地址本身已由 addressBook 的 selected-address 单独持久化。
 */
export interface CheckoutDraft {
  note: string
  payMethod: string
  agree: boolean
}

export function writeCheckoutDraft(draft: CheckoutDraft) {
  writeSession(STORAGE_KEYS.CHECKOUT_DRAFT, draft)
}

export function readCheckoutDraft(): CheckoutDraft | null {
  const draft = readSession<CheckoutDraft>(STORAGE_KEYS.CHECKOUT_DRAFT)
  if (!draft || typeof draft.note !== 'string') return null
  return draft
}

export function clearCheckoutDraft() {
  removeSession(STORAGE_KEYS.CHECKOUT_DRAFT)
}
