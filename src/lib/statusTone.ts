import type { LucideIcon } from 'lucide-react'
import { Check, Clock, RotateCcw, X } from 'lucide-react'

/**
 * 订单状态语义色：唯一来源，对应 ui-design-spec-v2.md §3.2「订单状态色」。
 * - warning：待支付 / 待用户处理
 * - success：待履约 / 已达成
 * - info：待收货 / 进行中
 * - violet：售后中
 * - muted：已完成 / 已取消
 * - destructive：异常关闭（仅用于取消类结果页）
 */
export type OrderStatusTone =
  | 'default'
  | 'success'
  | 'warning'
  | 'info'
  | 'violet'
  | 'muted'
  | 'destructive'

/** 状态文字色：订单列表与详情头部共用，保证同一状态在不同页面颜色一致。 */
export const ORDER_STATUS_TONE_CLASS: Record<OrderStatusTone, string> = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
  violet: 'text-violet',
  muted: 'text-subtle-foreground',
  destructive: 'text-destructive',
}

/** 状态胶囊底色：与文字色同源，供列表卡片使用（颜色之外还有形状，色弱可辨）。 */
export const ORDER_STATUS_BADGE_TONE = {
  default: 'neutral',
  success: 'success',
  warning: 'warning',
  info: 'info',
  violet: 'violet',
  muted: 'muted',
  destructive: 'danger',
} as const

/** 状态语义图标：待处理/进行中用时钟，已达成用对勾，异常用叉，售后用回转。 */
export const ORDER_STATUS_ICON: Record<OrderStatusTone, LucideIcon> = {
  default: Clock,
  success: Check,
  warning: Clock,
  info: Clock,
  violet: RotateCcw,
  muted: Check,
  destructive: X,
}
