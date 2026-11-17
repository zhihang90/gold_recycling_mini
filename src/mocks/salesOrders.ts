import { STORAGE_KEYS } from "./keys"
import { readSession, writeSession } from './storage'
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
}
export const SALES_STATUS_LABEL: Record<SalesStatus, string> = {
  'pending-payment': '待付款',
  'pending-shipment': '待发货',
  'pending-receipt': '待收货',
  completed: '已完成',
  'after-sale': '售后中',
  cancelled: '已取消',
}
export const SALES_FILTERS: { value: 'all' | SalesStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending-payment', label: '待付款' },
  { value: 'pending-shipment', label: '待发货' },
  { value: 'pending-receipt', label: '待收货' },
  { value: 'completed', label: '已完成' },
  { value: 'after-sale', label: '售后' },
]
export const DEMO_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'SO20261115001',
    status: 'pending-payment',
    createdAt: '2026-11-15 10:24',
    lines: [
      { productId: 'zodiac-sheet', variantId: 'zodiac-sheet:1g', spec: '1g', quantity: 1, price: 728 },
    ],
  },
  {
    id: 'SO20261112002',
    status: 'pending-shipment',
    createdAt: '2026-11-12 16:08',
    lines: [
      { productId: 'zodiac-bar', variantId: 'zodiac-bar:20g', spec: '20g', quantity: 1, price: 12760 },
    ],
  },
  {
    id: 'SO20261105003',
    status: 'pending-receipt',
    createdAt: '2026-11-05 09:41',
    lines: [{ productId: 'bean', variantId: 'bean:1g', spec: '1g', quantity: 2, price: 668 }],
  },
  {
    id: 'SO20261028004',
    status: 'completed',
    createdAt: '2026-10-28 14:02',
    lines: [
      { productId: 'bar-sheet', variantId: 'bar-sheet:10g', spec: '10g', quantity: 1, price: 6380 },
    ],
  },
  {
    id: 'SO20261020005',
    status: 'after-sale',
    createdAt: '2026-10-20 11:30',
    lines: [{ productId: 'coin', variantId: 'coin:2g', spec: '2g', quantity: 1, price: 1356 }],
  },
]
export function readSalesOrders(): SalesOrder[] {
  return readSession<SalesOrder[]>(STORAGE_KEYS.SALES_ORDERS) ?? DEMO_SALES_ORDERS
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
