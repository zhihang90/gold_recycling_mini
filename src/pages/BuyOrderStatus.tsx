import { ClipboardList } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button, DetailPage, EmptyState } from '@/components'
import {
  DEMO_SALES_ORDERS,
  PAY_WINDOW_MS,
  type SalesOrder,
  type SalesStatus,
} from '@/mocks/salesOrders'
import { paths } from '@/routes/paths'

import { BuyOrderDetailView } from './BuyOrderDetail'

/** 演示页每次进入都重新给待付款订单 1 分钟支付窗口，方便重复评审倒计时 */
function demoOrderFor(status: SalesStatus): SalesOrder | undefined {
  const found = DEMO_SALES_ORDERS.find((item) => item.status === status)
  if (!found) return undefined
  return found.status === 'pending-payment'
    ? { ...found, payDeadline: Date.now() + PAY_WINDOW_MS }
    : found
}

/**
 * 购买订单详情（按状态）：路由末段即订单状态，用固定的演示订单渲染。
 * 每个状态一条独立路由，方便需求评审逐状态对照页面差异。
 */
export function BuyOrderStatusPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const status = pathname.split('/').pop() as SalesStatus
  const [order, setOrder] = useState<SalesOrder | undefined>(() => demoOrderFor(status))

  // 状态页之间切换时重新取演示订单
  useEffect(() => {
    setOrder(demoOrderFor(status))
  }, [status])

  if (!order) {
    return (
      <DetailPage title="订单详情">
        <EmptyState
          icon={ClipboardList}
          title="暂无该状态的订单"
          description="当前状态没有可展示的演示订单，请返回订单列表查看。"
          action={<Button onClick={() => navigate(paths.orders)}>返回订单列表</Button>}
        />
      </DetailPage>
    )
  }

  return <BuyOrderDetailView order={order} onOrderChange={setOrder} />
}
