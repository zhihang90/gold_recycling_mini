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
