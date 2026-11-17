import { STORAGE_KEYS } from "./keys"
import { readSession, writeSession } from './storage'
/** 购物车行以「商品 + 规格」为最小单位，同一商品的不同克重分开计数。 */
export interface CartItem {
  productId: string
  variantId: string
  quantity: number
  selected: boolean
}
const listeners = new Set<() => void>()
/** 演示直达：?demo=cart 用两件样例商品渲染，不写入存储 */
export const DEMO_CART: CartItem[] = [
  {
    productId: 'zodiac-bar',
    variantId: 'zodiac-bar:20g',
    quantity: 1,
    selected: true,
  },
  { productId: 'bean', variantId: 'bean:1g', quantity: 2, selected: true },
]
/** 购物车存储：与地址、订单共用 sessionStorage 封装，隐私模式自动降级。 */
export function readCart(): CartItem[] {
  return readSession<CartItem[]>(STORAGE_KEYS.CART) ?? []
}
export function writeCart(items: CartItem[]) {
  writeSession(STORAGE_KEYS.CART, items)
  listeners.forEach((listener) => listener())
}
/** 加购：同规格累加数量并重新勾选，不同规格各自成行。 */
export function addToCart(productId: string, variantId: string, quantity = 1) {
  const items = readCart()
  const existing = items.find((item) => item.variantId === variantId)
  writeCart(
    existing
      ? items.map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity, selected: true }
            : item,
        )
      : [...items, { productId, variantId, quantity, selected: true }],
  )
}
export function cartCount(items: CartItem[] = readCart()) {
  return items.reduce((total, item) => total + item.quantity, 0)
}
/** 供底部 Tab 徽标订阅，加购与改数量时实时刷新 */
export function subscribeCart(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
