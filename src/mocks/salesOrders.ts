import { STORAGE_KEYS } from './keys'
import { readSession, writeSession } from './storage'
import { DEFAULT_ADDRESSES, type ShippingAddress } from './addressBook'
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
}
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
  { value: 'after-sale', label: '售后' },
]
const DEMO_ADDRESS = DEFAULT_ADDRESSES[0]
const DEMO_EXPRESS = { company: '顺丰速运', no: 'SF1234567890123' }

export const DEMO_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'SO20261115001',
    status: 'pending-payment',
    createdAt: '2026-11-15 10:24',
    lines: [
      { productId: 'zodiac-sheet', variantId: 'zodiac-sheet:1g', spec: '1g', quantity: 1, price: 728 },
    ],
    address: DEMO_ADDRESS,
    note: '工作日送达即可',
    payMethod: 'wechat',
  },
  {
    id: 'SO20261112002',
    status: 'pending-shipment',
    createdAt: '2026-11-12 16:08',
    lines: [
      { productId: 'zodiac-bar', variantId: 'zodiac-bar:20g', spec: '20g', quantity: 1, price: 12760 },
    ],
    address: DEMO_ADDRESS,
    payMethod: 'wechat',
    paidAt: '2026-11-12 16:09',
  },
  {
    id: 'SO20261105003',
    status: 'pending-receipt',
    createdAt: '2026-11-05 09:41',
    lines: [{ productId: 'bean', variantId: 'bean:1g', spec: '1g', quantity: 2, price: 668 }],
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
    lines: [
      { productId: 'bar-sheet', variantId: 'bar-sheet:10g', spec: '10g', quantity: 1, price: 6380 },
    ],
    address: DEMO_ADDRESS,
    payMethod: 'wechat',
    paidAt: '2026-10-28 14:03',
    express: { company: '顺丰速运', no: 'SF9876543210987' },
  },
  {
    id: 'SO20261020005',
    status: 'after-sale',
    createdAt: '2026-10-20 11:30',
    lines: [{ productId: 'coin', variantId: 'coin:2g', spec: '2g', quantity: 1, price: 1356 }],
    address: DEMO_ADDRESS,
    payMethod: 'unionpay',
    paidAt: '2026-10-20 11:31',
    express: { company: '顺丰速运', no: 'SF4567890123456' },
  },
  {
    id: 'SO20261015006',
    status: 'cancelled',
    createdAt: '2026-10-15 20:12',
    lines: [
      { productId: 'bar-sheet', variantId: 'bar-sheet:10g', spec: '10g', quantity: 1, price: 6380 },
    ],
    address: DEMO_ADDRESS,
    payMethod: 'wechat',
  },
]
/** 兼容早期写入的会话订单：补齐收货地址与待收货运单，避免详情页缺块 */
function normalizeOrder(order: SalesOrder): SalesOrder {
  if (order.address && (order.express || order.status !== 'pending-receipt')) return order
  return {
    ...order,
    address: order.address ?? DEMO_ADDRESS,
    express: order.express ?? (order.status === 'pending-receipt' ? DEMO_EXPRESS : undefined),
  }
}

export function readSalesOrders(): SalesOrder[] {
  const stored = readSession<SalesOrder[]>(STORAGE_KEYS.SALES_ORDERS)
  return stored ? stored.map(normalizeOrder) : DEMO_SALES_ORDERS
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
  return readSalesOrders().find((order) => order.id === id)
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
  }
}
