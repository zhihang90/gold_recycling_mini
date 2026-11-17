/**
 * 会话存储 Key 常量。
 * 所有 sessionStorage key 集中在此，改 key 前缀 / 版本迁移只改一个文件。
 * 命名统一：`gold-recycling.<模块>.<用途>`（点分隔的层级语义）
 */
export const STORAGE_KEYS = {
  /** 收货地址列表 */
  ADDRESSES: 'gold-recycling.addresses',
  /** 当前选中的收货地址 id */
  SELECTED_ADDRESS_ID: 'gold-recycling.selected-address',
  /** 购物车 */
  CART: 'gold_cart_items',
  /** 确认订单（buy） */
  CHECKOUT: 'gold_buy_checkout',
  /** 登录会员信息 */
  MEMBER: 'gold-recycling.member',
  /** 寄件订单草稿（回收流程） */
  ORDER_DRAFT: 'gold-recycling.order-draft',
  /** 估价快照（跨页面恢复报价结果） */
  QUOTE_SNAPSHOT: 'gold-recycling.quote-snapshot',
  /** 买金订单（演示 mock） */
  SALES_ORDERS: 'gold_sales_orders',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
