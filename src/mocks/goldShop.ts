import { images } from '@/assets/images'

/** 投资金销售页的静态数据：金价、公告、商品。真实售价以提交订单时为准。 */
export const SALE_RATE = {
  price: 608,
  source: '上海金交所 Au99.99',
  updatedAt: '今天 10:30',
}

export const SHOP_ANNOUNCEMENT = '安盛华集团 · 检测背书，买金与卖金共用一个账户'

export type GoldCategory = 'bar' | 'coin' | 'zodiac'

export interface GoldProduct {
  id: string
  name: string
  category: GoldCategory
  /** 图片下方的系列与规格说明，克重档位从这里解析 */
  caption: string
  /** 首档规格的售价，其余档位按克重同比折算 */
  price: number
  image: string
  /** 详情页轮播图；缺省时只展示 image 主图 */
  gallery?: string[]
  isNew?: boolean
}

/** 规格：同一商品的克重档位，价格按克重折算，购物车与详情页都以 variant 为最小单位。 */
export interface GoldVariant {
  id: string
  label: string
  grams: number
  price: number
  stock: number
}

/** 从 caption 中提取克重档位，如「规格：20克、50克、100克」→ [20, 50, 100]。 */
export function variantsOf(product: GoldProduct): GoldVariant[] {
  const grams = (product.caption.match(/\d+(?:\.\d+)?(?=\s*克)/g) ?? []).map(Number)
  const weights = grams.length > 0 ? grams : [1]
  const unitPrice = product.price / weights[0]

  return weights.map((weight, index) => ({
    id: `${product.id}:${weight}g`,
    label: `${weight}g`,
    grams: weight,
    price: Math.round(unitPrice * weight),
    stock: [26, 18, 9, 5][index] ?? 3,
  }))
}

export function findProduct(id: string) {
  return GOLD_PRODUCTS.find((product) => product.id === id)
}

export function findVariant(product: GoldProduct, variantId: string) {
  return variantsOf(product).find((variant) => variant.id === variantId)
}

/** 商品卖点：按品类给一句与场景相关的短句。 */
export function taglineOf(product: GoldProduct) {
  if (product.category === 'coin') return '收藏送礼 · 攒金压岁'
  if (product.category === 'zodiac') return '生肖贺岁 · 收藏送礼'
  return '投资储值 · 支持随时回售'
}

/** 演示销量：按商品 id 生成稳定数值，刷新页面不会变化。 */
export function soldOf(product: GoldProduct) {
  const seed = Array.from(product.id).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return (seed % 60) + 3
}

/** 一行商品对应一个系列，不同克重收进 variants，列表与详情共用同一份数据。 */
export const GOLD_PRODUCTS: GoldProduct[] = [
  {
    id: 'zodiac-sheet',
    name: '丁未羊年金片',
    category: 'zodiac',
    caption: '丁未羊年 · 规格：1克',
    price: 728,
    image: images.productZodiac,
    gallery: [images.productZodiac, images.productZodiacDetail, images.buyHero],
    isNew: true,
  },
  {
    id: 'zodiac-bar',
    name: '丁未羊年贺岁金条',
    category: 'zodiac',
    caption: '规格：20克、50克、100克、200克',
    price: 12760,
    image: images.productZodiac,
    isNew: true,
  },
  {
    id: 'zodiac-legacy',
    name: '丁未羊年传世金条',
    category: 'zodiac',
    caption: '规格：30克、50克、100克',
    price: 19150,
    image: images.productZodiac,
  },
  {
    id: 'bar-sheet',
    name: '足金金条 AU9999 薄片款',
    category: 'bar',
    caption: '薄片款 · 规格：10克、20克',
    price: 6380,
    image: images.productBar10g,
  },
  {
    id: 'bar-cf',
    name: '足金金条 AU9999 CF款',
    category: 'bar',
    caption: 'CF款 · 规格：10克、100克',
    price: 6380,
    image: images.productBar5g,
  },
  {
    id: 'bar-trapezoid',
    name: '足金金条 AU9999 梯形款',
    category: 'bar',
    caption: '梯形款 · 规格：20克、50克、100克、200克',
    price: 12760,
    image: images.productBar10g,
  },
  {
    id: 'coin',
    name: '足金投资金币',
    category: 'coin',
    caption: '规格：2克',
    price: 1356,
    image: images.productCoin,
  },
  {
    id: 'bean',
    name: '足金金豆',
    category: 'bar',
    caption: '规格：1克',
    price: 668,
    image: images.productBean,
  },
  {
    id: 'knot',
    name: '福运中国结金章',
    category: 'zodiac',
    caption: '规格：1克',
    price: 768,
    image: images.productZodiac,
  },
]

export const SHOP_CATEGORIES: { value: 'all' | GoldCategory; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'bar', label: '金条' },
  { value: 'zodiac', label: '生肖金条' },
  { value: 'coin', label: '金币' },
]
