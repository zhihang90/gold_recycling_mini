import { useNavigate } from 'react-router-dom'
import { paths } from '@/routes/paths'

export interface OrderStep {
  key: string
  path: string
  title: string
}

/**
 * 订单主链的步骤表：顺序、路径、标题的唯一来源。
 * 新增步骤（实名、绑卡、电子签、确认）时只在这里按顺序补一条，
 * 各页的「下一步：xxx」文案与跳转自动跟随，不需要回头改前面的页面。
 */
export const ORDER_STEPS = [
  { key: 'item', path: paths.order.item, title: '物品信息' },
  { key: 'source', path: paths.order.source, title: '合法来源声明' },
  { key: 'agreement', path: paths.order.agreement, title: '协议与破检授权' },
  { key: 'shipping', path: paths.order.shipping, title: '寄件与保价' },
] as const

export type OrderStepKey = (typeof ORDER_STEPS)[number]['key']

/** 当前步骤在流程中的位置，以及上一步/下一步的跳转 */
export function useOrderStep(key: OrderStepKey) {
  const navigate = useNavigate()
  const index = ORDER_STEPS.findIndex((step) => step.key === key)
  const step = ORDER_STEPS[index]
  const next = ORDER_STEPS[index + 1]
  const previous = index > 0 ? ORDER_STEPS[index - 1] : undefined

  return {
    step,
    index,
    total: ORDER_STEPS.length,
    next,
    nextLabel: next ? `下一步：${next.title}` : undefined,
    goNext: next ? () => navigate(next.path) : undefined,
    goBack: previous ? () => navigate(previous.path) : undefined,
  }
}
