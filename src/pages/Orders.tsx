import { BottomSheet, Button, Card, Chip, EmptyState, MediaVisual, PriceText, TabPage, Toast } from '@/components'
import { useEffect, useState } from 'react'
import { ClipboardList, Store } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { addToCart } from '@/mocks/cart'
import { findProduct } from '@/mocks/goldShop'
import {
  RECYCLE_FILTERS,
  RECYCLE_STATUS_LABEL,
  RECYCLE_STATUS_TONE,
  RECYCLE_STEPS,
  DEMO_RECYCLE_ORDERS,
  type RecycleStatus,
} from '@/mocks/recycleOrders'
import {
  SALES_FILTERS,
  SALES_STATUS_LABEL,
  SALES_STATUS_TONE,
  readSalesOrders,
  salesCount,
  salesTotal,
  writeSalesOrders,
  type SalesOrder,
  type SalesStatus,
} from '@/mocks/salesOrders'
import { cn } from '@/lib/utils'
import { ORDER_STATUS_TONE_CLASS } from '@/lib/statusTone'
import { paths, orderDetailPath } from '@/routes/paths'

type OrderTab = 'sales' | 'recycle'

type TimelineSheet = {
  title: string
  current: number
  steps: { label: string; description?: string }[]
}

const LOGISTICS_STEPS = [
  { label: '顺丰已揽收', description: '深圳南山集散中心' },
  { label: '运输中', description: '预计 1 天后到达' },
  { label: '派送中', description: '快递员将电话联系您' },
]

/** 订单：买金订单与回收订单并行，两类订单各自一套状态与筛选。 */
export function OrdersPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [tab, setTab] = useState<OrderTab>(params.get('type') === 'recycle' ? 'recycle' : 'sales')
  const [salesFilter, setSalesFilter] = useState<'all' | SalesStatus>(
    (params.get('status') as SalesStatus | null) ?? 'all',
  )
  const [recycleFilter, setRecycleFilter] = useState<'all' | RecycleStatus>('all')
  const [salesOrders, setSalesOrders] = useState(readSalesOrders)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [timeline, setTimeline] = useState<TimelineSheet | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const typeParam = params.get('type')
  const statusParam = params.get('status')

  // 个人中心的订单入口带参数直达：参数变化时同步业务类型与状态筛选
  useEffect(() => {
    if (typeParam === 'recycle') {
      setTab('recycle')
      setRecycleFilter((statusParam as RecycleStatus | null) ?? 'all')
      return
    }
    setTab('sales')
    setSalesFilter((statusParam as SalesStatus | null) ?? 'all')
  }, [typeParam, statusParam])

  const switchTab = (next: OrderTab) => {
    setTab(next)
    setSalesFilter('all')
    setRecycleFilter('all')
  }

  const moveOrder = (id: string, status: SalesStatus) => {
    setSalesOrders((prev) => {
      const next = prev.map((order) => (order.id === id ? { ...order, status } : order))
      writeSalesOrders(next)
      return next
    })
  }

  const salesRows =
    salesFilter === 'all'
      ? salesOrders
      : salesOrders.filter((order) => order.status === salesFilter)

  const recycleRows =
    recycleFilter === 'all'
      ? DEMO_RECYCLE_ORDERS
      : DEMO_RECYCLE_ORDERS.filter((order) => order.status === recycleFilter)

  const filters = tab === 'sales' ? SALES_FILTERS : RECYCLE_FILTERS
  const activeFilter = tab === 'sales' ? salesFilter : recycleFilter

  const rebuy = (order: SalesOrder) => {
    order.lines.forEach((line) => addToCart(line.productId, line.variantId, line.quantity))
    navigate(paths.cart)
  }

  return (
    <TabPage contentClassName="space-y-3">
      <div className="-mx-4 flex items-center gap-7 border-b border-border-subtle px-4">
        {[
          { key: 'sales' as const, label: '买金订单' },
          { key: 'recycle' as const, label: '回收订单' },
        ].map((item) => {
          const active = tab === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => switchTab(item.key)}
              aria-pressed={active}
              className={cn(
                'relative -mb-px pb-2.5 text-body transition',
                active
                  ? 'text-body-strong text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {item.label}
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px mx-auto h-0.5 w-6 rounded-full bg-gold-700"
                />
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {filters.map((item) => (
          <Chip
            key={item.value}
            active={activeFilter === item.value}
            onClick={() =>
              tab === 'sales'
                ? setSalesFilter(item.value as 'all' | SalesStatus)
                : setRecycleFilter(item.value as 'all' | RecycleStatus)
            }
          >
            {item.label}
          </Chip>
        ))}
      </div>

      {tab === 'sales' ? (
        salesRows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="暂无相关订单"
            description="买金下单后可在这里查看支付与物流进度。"
          />
        ) : (
          salesRows.map((order) => (
            <Card
              key={order.id}
              padding="sm"
              role="link"
              tabIndex={0}
              aria-label={`查看订单 ${order.id} 详情`}
              onClick={() => navigate(orderDetailPath(order.id))}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  navigate(orderDetailPath(order.id))
                }
              }}
              className="cursor-pointer space-y-3 transition active:bg-surface-2"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-caption-strong text-foreground">
                  <Store size={14} className="text-gold-700" aria-hidden="true" />
                  安盛华投资金
                </span>
                <span
                  className={cn(
                    'text-caption-strong',
                    ORDER_STATUS_TONE_CLASS[SALES_STATUS_TONE[order.status]],
                  )}
                >
                  {SALES_STATUS_LABEL[order.status]}
                </span>
              </div>

              {order.lines.map((line) => {
                const product = findProduct(line.productId)
                return (
                  <div key={line.variantId} className="flex gap-3">
                    {product ? (
                      <MediaVisual
                        src={product.image}
                        alt={product.name}
                        className="h-16 w-16 shrink-0 rounded-md bg-gold-50"
                      />
                    ) : (
                      <div className="h-16 w-16 shrink-0 rounded-md bg-gold-50" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-body text-foreground">
                        {product?.name ?? '商品已下架'}
                      </p>
                      <p className="mt-1 text-caption text-subtle-foreground">
                        规格 {line.spec} · 共 {line.quantity} 件
                      </p>
                    </div>
                    <PriceText value={line.price} size="body" tone="gold" />
                  </div>
                )
              })}

              <div className="flex items-end justify-between gap-3 border-t border-border-subtle pt-2.5">
                <div className="min-w-0">
                  <p className="truncate text-caption text-subtle-foreground">订单号 {order.id}</p>
                  <p className="mt-0.5 text-caption text-subtle-foreground">{order.createdAt}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-caption text-subtle-foreground">
                    共 {salesCount(order)} 件
                  </p>
                  <p className="mt-0.5 text-body-strong text-gold-800">
                    合计 ¥{salesTotal(order).toLocaleString()}
                  </p>
                </div>
              </div>

              <div
                className="flex flex-wrap justify-end gap-2"
                onClick={(event) => event.stopPropagation()}
              >
                {order.status === 'pending-payment' ? (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setCancelId(order.id)}
                    >
                      取消订单
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        moveOrder(order.id, 'pending-shipment')
                        setToast('支付成功，等待发货')
                      }}
                    >
                      立即付款
                    </Button>
                  </>
                ) : null}

                {order.status === 'pending-shipment' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setToast('客服将在 9:00–21:00 回复')}
                  >
                    联系客服
                  </Button>
                ) : null}

                {order.status === 'pending-receipt' ? (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setTimeline({
                          title: '物流进度',
                          current: 1,
                          steps: LOGISTICS_STEPS,
                        })
                      }
                    >
                      查看物流
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        moveOrder(order.id, 'completed')
                        setToast('已确认收货')
                      }}
                    >
                      确认收货
                    </Button>
                  </>
                ) : null}

                {order.status === 'completed' ? (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setToast('售后申请已提交，客服会尽快联系您')}
                    >
                      申请售后
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => rebuy(order)}
                    >
                      再次购买
                    </Button>
                  </>
                ) : null}

                {order.status === 'after-sale' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setToast('售后处理中，预计 1 个工作日内反馈')}
                  >
                    售后进度
                  </Button>
                ) : null}

                {order.status === 'cancelled' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => rebuy(order)}
                  >
                    再次购买
                  </Button>
                ) : null}
              </div>
            </Card>
          ))
        )
      ) : recycleRows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="暂无相关订单"
          description="寄出物品后，检测与打款进度将在这里更新。"
        />
      ) : (
        recycleRows.map((order) => (
          <Card
            key={order.id}
            padding="sm"
            className="space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-caption-strong text-foreground">黄金回收</span>
              <span
                className={cn(
                  'text-caption-strong',
                  ORDER_STATUS_TONE_CLASS[RECYCLE_STATUS_TONE[order.status]],
                )}
              >
                {RECYCLE_STATUS_LABEL[order.status]}
              </span>
            </div>

            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-body text-foreground">{order.category}</p>
                <p className="mt-1 text-caption text-subtle-foreground">
                  {order.weight} · {order.purity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-caption text-subtle-foreground">预估价</p>
                <PriceText value={order.estimate} size="body" tone="gold" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-2.5">
              <p className="text-caption text-subtle-foreground">
                {order.id} · {order.createdAt}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setToast('客服将在 9:00–21:00 回复')}
              >
                联系客服
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const current = RECYCLE_STEPS.findIndex((step) => step.key === order.status)
                  setTimeline({
                    title: '回收进度',
                    current: Math.max(current, 0),
                    steps: RECYCLE_STEPS.map((step) => ({
                      label: step.label,
                      description: step.description,
                    })),
                  })
                }}
              >
                查看进度
              </Button>
            </div>
          </Card>
        ))
      )}

      <BottomSheet
        open={cancelId !== null}
        onClose={() => setCancelId(null)}
        title="取消订单"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" block onClick={() => setCancelId(null)}>
              再想想
            </Button>
            <Button
              variant="danger"
              block
              onClick={() => {
                if (cancelId) moveOrder(cancelId, 'cancelled')
                setCancelId(null)
                setToast('订单已取消')
              }}
            >
              确认取消
            </Button>
          </div>
        }
      >
        <p className="text-body text-muted-foreground">
          待付款订单取消后立即关闭，不会扣款；需要时可在订单中再次购买。
        </p>
      </BottomSheet>

      <BottomSheet
        open={timeline !== null}
        onClose={() => setTimeline(null)}
        title={timeline?.title ?? ''}
        footer={
          <Button
            block
            onClick={() => setTimeline(null)}
          >
            知道了
          </Button>
        }
      >
        <ol className="space-y-4">
          {(timeline?.steps ?? []).map((step, index) => {
            const reached = index <= (timeline?.current ?? 0)
            return (
              <li key={step.label} className="flex gap-3">
                <span
                  className={cn(
                    'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                    reached ? 'bg-gold-700' : 'bg-line',
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-body',
                      reached ? 'text-foreground' : 'text-subtle-foreground',
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description ? (
                    <p className="mt-0.5 text-caption text-subtle-foreground">
                      {step.description}
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </BottomSheet>

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </TabPage>
  )
}
