import { images } from '@/assets/images'

import { salePriceOf } from './pricing'

/** 投资金条按克重分为五档，每档一个商品，不存在多规格选择。 */
export const GOLD_WEIGHTS = [5, 10, 20, 50, 100] as const
export type GoldWeight = (typeof GOLD_WEIGHTS)[number]

export interface GoldProduct {
  id: string
  name: string
  /** 该商品的唯一克重，页面不提供规格切换 */
  grams: GoldWeight
  /** 规格说明：克重 + 纯度，如「规格：5克 AU9999」 */
  caption: string
  image: string
  /** 详情页轮播图；缺省时只展示 image 主图 */
  gallery?: string[]
  isNew?: boolean
}

/** 购物车、订单仍以 variant 为最小单位，单规格商品固定返回一个 variant。 */
export interface GoldVariant {
  id: string
  label: string
  grams: number
  price: number
  stock: number
}

export function variantsOf(product: GoldProduct): GoldVariant[] {
  return [
    {
      id: `${product.id}:${product.grams}g`,
      label: `${product.grams}克`,
      grams: product.grams,
      price: salePriceOf(product.grams),
      stock: 26,
    },
  ]
}

export function findProduct(id: string) {
  return GOLD_PRODUCTS.find((product) => product.id === id)
}

export function findVariant(product: GoldProduct, variantId: string) {
  return variantsOf(product).find((variant) => variant.id === variantId)
}

/** 按克重取商品：无完全匹配时取最接近的一档，用于行情页与历史数据的兜底。 */
export function productForGrams(grams: number): GoldProduct {
  const exact = GOLD_PRODUCTS.find((product) => product.grams === grams)
  if (exact) return exact
  return GOLD_PRODUCTS.reduce((best, product) =>
    Math.abs(product.grams - grams) < Math.abs(best.grams - grams) ? product : best,
  )
}

/**
 * 修复历史数据里的商品标识：早期 mock 商品已下线，
 * 按规格克重映射到当前五档商品，保证详情与订单正常展示。
 */
export function repairLine<T extends { productId: string; variantId: string; spec: string }>(
  line: T,
): T {
  const product = findProduct(line.productId)
  if (product) return line
  const grams =
    Number.parseInt(line.spec, 10) || Number.parseInt(line.variantId.split(':')[1] ?? '', 10) || 5
  const target = productForGrams(grams)
  return {
    ...line,
    productId: target.id,
    variantId: `${target.id}:${target.grams}g`,
    spec: `${target.grams}克`,
  }
}

/** 金条纯度，作为规格的一部分展示（如「5克 AU9999」）。 */
export const PRODUCT_PURITY = 'AU9999'

/** 演示销量：按商品 id 生成稳定数值，刷新页面不会变化。 */
export function soldOf(product: GoldProduct) {
  const seed = Array.from(product.id).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return (seed % 60) + 3
}

/** 五个克重各一个商品，列表页按克重页签筛选，详情页直接按该克重售卖。 */
export const GOLD_PRODUCTS: GoldProduct[] = GOLD_WEIGHTS.map((grams) => ({
  id: `bar-${grams}g`,
  name: '足金投资金条',
  grams,
  caption: `规格：${grams}克 ${PRODUCT_PURITY}`,
  image: grams <= 10 ? images.productBar5g : images.productBar10g,
  gallery: [images.productBar5g, images.productBar10g, images.buyHero],
  isNew: grams === 5,
}))

/** 分类页签：0 表示「全部」，其余为具体克重。 */
export const SHOP_CATEGORIES: { value: 0 | GoldWeight; label: string }[] = [
  { value: 0, label: '全部' },
  ...GOLD_WEIGHTS.map((grams) => ({ value: grams, label: `${grams}克` })),
]
