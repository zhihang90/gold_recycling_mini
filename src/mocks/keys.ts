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
  /** 买金订单提交结果（成功页快照） */
  CHECKOUT_RESULT: 'gold-recycling.checkout-result',
  /** 登录会员信息 */
  MEMBER: 'gold-recycling.member',
  /** 估价快照（跨页面恢复报价结果） */
  QUOTE_SNAPSHOT: 'gold-recycling.quote-snapshot',
  /** 回收预约表单草稿（离开页面后返回可恢复） */
  QUOTE_DRAFT: 'gold-recycling.quote-draft',
  /** 回收预约已选实物照片（base64 大对象，单独存放） */
  QUOTE_DRAFT_PHOTOS: 'gold-recycling.quote-draft-photos',
  /** 确认订单表单草稿 */
  CHECKOUT_DRAFT: 'gold-recycling.checkout-draft',
  /** 协议阅读确认结果（含黄金来源） */
  AGREEMENT_CONFIRMATION: 'gold-recycling.agreement-confirmation',
  /** 买金订单（演示 mock） */
  SALES_ORDERS: 'gold_sales_orders',
  /** 收款账户（银行卡列表） */
  BANK_ACCOUNTS: 'gold-recycling.bank-accounts',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
