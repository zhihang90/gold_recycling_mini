import { images } from '@/assets/images'

/** 投资金销售页的静态数据：金价、商品、信任点。真实售价以提交订单时为准。 */
export const SALE_RATE = {
  price: 608,
  source: '上海黄金交易所 Au99.99',
  updatedAt: '今天 10:30',
}

export type GoldCategory = 'bar' | 'coin' | 'zodiac'

export interface GoldProduct {
  id: string
  name: string
  category: GoldCategory
  spec: string
  price: number
  image: string
}

export const GOLD_PRODUCTS: GoldProduct[] = [
  { id: 'bar-1g', name: '安盛华投资金条', category: 'bar', spec: '1g · 足金 999.9', price: 658, image: images.productBar1g },
  { id: 'bar-5g', name: '安盛华投资金条', category: 'bar', spec: '5g · 足金 999.9', price: 3180, image: images.productBar5g },
  { id: 'bar-10g', name: '安盛华投资金条', category: 'bar', spec: '10g · 足金 999.9', price: 6320, image: images.productBar10g },
  { id: 'coin-2g', name: '安盛华投资金币', category: 'coin', spec: '2g · 足金 999.9', price: 1356, image: images.productCoin },
  { id: 'zodiac-5g', name: '生肖金条 · 马年', category: 'zodiac', spec: '5g · 足金 999.9', price: 3260, image: images.productZodiac },
  { id: 'bean-1g', name: '投资金豆', category: 'bar', spec: '1g · 足金 999.9', price: 668, image: images.productBean },
]

export const SHOP_TRUST = [
  { key: 'assay', title: '集团检测背书', description: '每件附检测证书，克重与纯度可查' },
  { key: 'cert', title: '一物一证', description: '编号与证书对应，支持复检' },
  { key: 'recycle', title: '支持回收变现', description: '同一平台可直接发起回收' },
  { key: 'delivery', title: '顺丰保价配送', description: '全程可追踪，签收需本人验证' },
] as const

export const SHOP_CATEGORIES: { value: 'all' | GoldCategory; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'bar', label: '金条' },
  { value: 'coin', label: '金币' },
  { value: 'zodiac', label: '生肖' },
]
