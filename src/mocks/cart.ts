import { STORAGE_KEYS } from './keys'
import { readSession, writeSession } from './storage'
import { findProduct, productForGrams } from './goldShop'
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
    productId: 'bar-20g',
    variantId: 'bar-20g:20g',
    quantity: 1,
    selected: true,
  },
  { productId: 'bar-5g', variantId: 'bar-5g:5g', quantity: 2, selected: true },
]
/** 修复历史购物车里的失效商品：按克重映射到当前在售商品 */
function repairCartItem(item: CartItem): CartItem {
  if (findProduct(item.productId)) return item
  const grams = Number.parseInt(item.variantId.split(':')[1] ?? '', 10) || 5
  const product = productForGrams(grams)
  return { ...item, productId: product.id, variantId: `${product.id}:${product.grams}g` }
}
/** 购物车存储：与地址、订单共用 sessionStorage 封装，隐私模式自动降级。 */
export function readCart(): CartItem[] {
  return (readSession<CartItem[]>(STORAGE_KEYS.CART) ?? []).map(repairCartItem)
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
