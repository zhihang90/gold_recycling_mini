import { STORAGE_KEYS } from './keys'
import { readSession, writeSession } from './storage'
import { DEFAULT_ADDRESSES, type ShippingAddress } from './addressBook'
import { productForGrams, repairLine } from './goldShop'
import { salePriceOf } from './pricing'
import type { OrderStatusTone } from '@/lib/statusTone'
/**
 * 买金（销售）订单：与回收订单并行的一类订单，共用登录态。
 * 状态取自业务给定的流转图，不含「自提」。
 */
export type SalesStatus =
  | 'pending-payment'
  | 'pending-shipment'
  | 'pending-receipt'
  | 'completed'
  | 'after-sale'
  | 'cancelled'
export type SalesPayMethod = 'wechat' | 'alipay' | 'unionpay'
export interface SalesOrderLine {
  productId: string
  variantId: string
  spec: string
  quantity: number
  price: number
}
export interface SalesOrder {
  id: string
  status: SalesStatus
  createdAt: string
  lines: SalesOrderLine[]
  /** 以下为确认订单页带入的收货与支付信息，详情页展示用 */
  address?: ShippingAddress
  note?: string
  payMethod?: SalesPayMethod
  paidAt?: string
  express?: { company: string; no: string }
  /** 待付款支付截止时间（毫秒时间戳）：金价波动大，下单后需在 1 分钟内完成支付 */
  payDeadline?: number
}
/** 待付款支付窗口：1 分钟 */
export const PAY_WINDOW_MS = 60_000
export const SALES_STATUS_LABEL: Record<SalesStatus, string> = {
  'pending-payment': '待付款',
  'pending-shipment': '待发货',
  'pending-receipt': '待收货',
  completed: '已完成',
  'after-sale': '售后中',
  cancelled: '已取消',
}
/** 状态语义色：列表与详情共用，取值见 ui-design-spec-v2.md §3.2。 */
export const SALES_STATUS_TONE: Record<SalesStatus, OrderStatusTone> = {
  'pending-payment': 'warning',
  'pending-shipment': 'success',
  'pending-receipt': 'info',
  completed: 'muted',
  'after-sale': 'violet',
  cancelled: 'muted',
}
export const SALES_PAY_LABEL: Record<SalesPayMethod, string> = {
  wechat: '微信支付',
  alipay: '支付宝',
  unionpay: '云闪付',
}
export const SALES_FILTERS: { value: 'all' | SalesStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending-payment', label: '待付款' },
  { value: 'pending-shipment', label: '待发货' },
  { value: 'pending-receipt', label: '待收货' },
  { value: 'completed', label: '已完成' },
  { value: 'after-sale', label: '售后中' },
]
const DEMO_ADDRESS = DEFAULT_ADDRESSES[0]
const DEMO_EXPRESS = { company: '顺丰速运', no: 'SF1234567890123' }

/** 订单行统一按当前在售克重商品生成，避免商品 mock 调整后订单里出现失效商品。 */
function demoLine(grams: number, quantity = 1): SalesOrderLine {
  const product = productForGrams(grams)
  return {
    productId: product.id,
    variantId: `${product.id}:${product.grams}g`,
    spec: `${product.grams}克`,
    quantity,
    price: salePriceOf(product.grams),
  }
}

export const DEMO_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'SO20261115001',
    status: 'pending-payment',
    createdAt: '2026-11-15 10:24',
    lines: [demoLine(5)],
    address: DEMO_ADDRESS,
    note: '工作日送达即可',
    payMethod: 'wechat',
    payDeadline: Date.now() + PAY_WINDOW_MS,
  },
  {
    id: 'SO20261112002',
    status: 'pending-shipment',
    createdAt: '2026-11-12 16:08',
    lines: [demoLine(20)],
    address: DEMO_ADDRESS,
    payMethod: 'wechat',
    paidAt: '2026-11-12 16:09',
  },
  {
    id: 'SO20261105003',
    status: 'pending-receipt',
    createdAt: '2026-11-05 09:41',
    lines: [demoLine(10, 2)],
    address: DEMO_ADDRESS,
    note: '请放快递柜',
    payMethod: 'alipay',
    paidAt: '2026-11-05 09:42',
    express: DEMO_EXPRESS,
  },
  {
    id: 'SO20261028004',
    status: 'completed',
    createdAt: '2026-10-28 14:02',
    lines: [demoLine(10)],
    address: DEMO_ADDRESS,
    payMethod: 'wechat',
    paidAt: '2026-10-28 14:03',
    express: { company: '顺丰速运', no: 'SF9876543210987' },
  },
  {
    id: 'SO20261020005',
    status: 'after-sale',
    createdAt: '2026-10-20 11:30',
    lines: [demoLine(20)],
    address: DEMO_ADDRESS,
    payMethod: 'unionpay',
    paidAt: '2026-10-20 11:31',
    express: { company: '顺丰速运', no: 'SF4567890123456' },
  },
  {
    id: 'SO20261015006',
    status: 'cancelled',
    createdAt: '2026-10-15 20:12',
    lines: [demoLine(5)],
    address: DEMO_ADDRESS,
    payMethod: 'wechat',
  },
]
/** 兼容早期写入的会话订单：补齐收货地址、待收货运单与待付款支付截止时间，并修复失效商品 */
function normalizeOrder(order: SalesOrder): SalesOrder {
  const needsAddress = !order.address
  const needsExpress = !order.express && order.status === 'pending-receipt'
  const needsDeadline = order.status === 'pending-payment' && !order.payDeadline
  const lines = order.lines.map(repairLine)
  const linesChanged = lines.some((line, index) => line !== order.lines[index])
  if (!needsAddress && !needsExpress && !needsDeadline && !linesChanged) return order
  return {
    ...order,
    lines,
    address: order.address ?? DEMO_ADDRESS,
    express: order.express ?? (order.status === 'pending-receipt' ? DEMO_EXPRESS : undefined),
    payDeadline: needsDeadline ? Date.now() + PAY_WINDOW_MS : order.payDeadline,
  }
}

export function readSalesOrders(): SalesOrder[] {
  const stored = readSession<SalesOrder[]>(STORAGE_KEYS.SALES_ORDERS)
  if (!stored) return DEMO_SALES_ORDERS
  const normalized = stored.map(normalizeOrder)
  // 补齐的支付截止时间需要落盘，否则每次读取都会重置 1 分钟支付窗口
  if (normalized.some((order, index) => order !== stored[index])) {
    writeSession(STORAGE_KEYS.SALES_ORDERS, normalized)
  }
  return normalized
}
export function writeSalesOrders(orders: SalesOrder[]) {
  writeSession(STORAGE_KEYS.SALES_ORDERS, orders)
}
export function salesTotal(order: SalesOrder) {
  return order.lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
}
export function salesCount(order: SalesOrder) {
  return order.lines.reduce((sum, line) => sum + line.quantity, 0)
}

export function findSalesOrder(id: string) {
  // 会话里已有订单时仍可从菜单直达演示订单，避免演示入口变成「订单不存在」
  return (
    readSalesOrders().find((order) => order.id === id) ??
    DEMO_SALES_ORDERS.find((order) => order.id === id)
  )
}

/** 更新单笔订单并落盘，返回更新后的订单 */
export function updateSalesOrder(id: string, patch: Partial<SalesOrder>): SalesOrder | undefined {
  const orders = readSalesOrders()
  const next = orders.map((order) => (order.id === id ? { ...order, ...patch } : order))
  writeSalesOrders(next)
  return next.find((order) => order.id === id)
}

export interface NewSalesOrderInput {
  lines: SalesOrderLine[]
  address: ShippingAddress
  note?: string
  payMethod: SalesPayMethod
}

/** 订单展示用的「YYYY-MM-DD HH:mm」时间 */
export function salesTimeNow() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

/** 提交订单即落一笔「待付款」订单；支付成功后由页面更新为待发货 */
export function createSalesOrder(input: NewSalesOrderInput): SalesOrder {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const prefix = `SO${date}`
  const seq = readSalesOrders().filter((order) => order.id.startsWith(prefix)).length + 1
  const time = salesTimeNow()

  return {
    id: `${prefix}${String(seq).padStart(3, '0')}`,
    status: 'pending-payment',
    createdAt: time,
    address: input.address,
    note: input.note || undefined,
    payMethod: input.payMethod,
    lines: input.lines,
    payDeadline: Date.now() + PAY_WINDOW_MS,
  }
}
