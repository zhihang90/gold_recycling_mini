import {
  Badge,
  BottomSheet,
  Button,
  Card,
  CountdownBar,
  EmptyState,
  ListPage,
  MediaVisual,
  PaymentPasswordSheet,
  PriceText,
  SegmentedTabs,
  Toast,
} from '@/components'
import { useEffect, useState } from 'react'
import { ClipboardList, Store } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { addToCart } from '@/mocks/cart'
import { writeCheckoutResult } from '@/mocks/checkout'
import { findProduct } from '@/mocks/goldShop'
import {
  RECYCLE_TABS,
  RECYCLE_STATUS_LABEL,
  RECYCLE_STATUS_TONE,
  DEMO_RECYCLE_ORDERS,
  matchesRecycleTab,
  recycleTabOf,
  type RecycleStatus,
  type RecycleTab,
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
import {
  ORDER_STATUS_BADGE_TONE,
  ORDER_STATUS_ICON,
  ORDER_STATUS_TONE_CLASS,
} from '@/lib/statusTone'
import { paths, orderDetailPath, recycleOrderDetailPath } from '@/routes/paths'

type OrderTab = 'sales' | 'recycle'

/**
 * 查询串变化会让页面重新挂载（见 app.tsx 的 key={search}）。
 * 记下上一次的业务页签，让指示条在新视图挂载后仍从旧位置滑过去。
 */
let lastOrderTab: OrderTab | null = null

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

/** 回收卡片主操作文案：按用户下一步要做的事命名，而非后台状态名 */
const RECYCLE_CARD_ACTION: Record<RecycleStatus, string> = {
  review: '查看进度',
  'pending-ship': '去寄件',
  'pending-receipt': '查看物流',
  testing: '观看直播',
  'pending-confirm': '去确认',
  'pending-payment': '查看进度',
  completed: '再次回收',
  cancelled: '再次回收',
  closed: '再次回收',
}

/** 回收订单状态胶囊：底色 + 语义图标，避免只靠文字颜色区分 */
function RecycleStatusBadge({ status }: { status: RecycleStatus }) {
  const tone = RECYCLE_STATUS_TONE[status]
  const Icon = ORDER_STATUS_ICON[tone]
  return (
    <Badge tone={ORDER_STATUS_BADGE_TONE[tone]}>
      <Icon size={12} aria-hidden="true" />
      {RECYCLE_STATUS_LABEL[status]}
    </Badge>
  )
}

/** 待确认倒计时：从剩余分钟数起算，列表内实时递减 */
function ConfirmCountdown({ minutes }: { minutes: number }) {
  const [deadline] = useState(() => Date.now() + minutes * 60_000)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const remain = Math.max(deadline - now, 0)
  const mm = String(Math.floor(remain / 60_000)).padStart(2, '0')
  const ss = String(Math.floor((remain % 60_000) / 1000)).padStart(2, '0')

  return (
    <span className="tabular text-caption-strong text-warning">
      剩余 {mm}:{ss}
    </span>
  )
}

/** 订单：买金订单与回收订单并行，两类订单各自一套状态与筛选。 */
export function OrdersPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<OrderTab>(params.get('type') === 'recycle' ? 'recycle' : 'sales')
  // 指示条起始位置：跨重挂载时先落在旧页签，下一帧再滑到新页签
  const [indicatorFrom, setIndicatorFrom] = useState<OrderTab | null>(() =>
    lastOrderTab && lastOrderTab !== tab ? lastOrderTab : null,
  )
  const indicatorTab = indicatorFrom ?? tab
  const [salesFilter, setSalesFilter] = useState<'all' | SalesStatus>(
    (params.get('status') as SalesStatus | null) ?? 'all',
  )
  const [recycleFilter, setRecycleFilter] = useState<RecycleTab>('all')
  const [salesOrders, setSalesOrders] = useState(readSalesOrders)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [payId, setPayId] = useState<string | null>(null)
  const [timeline, setTimeline] = useState<TimelineSheet | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const typeParam = params.get('type')
  const statusParam = params.get('status')

  // 个人中心的订单入口带参数直达：参数变化时同步业务类型与状态筛选
  useEffect(() => {
    if (typeParam === 'recycle') {
      setTab('recycle')
      // 个人中心可能带系统状态进来，统一折算成用户侧 Tab
      setRecycleFilter(recycleTabOf(statusParam as RecycleStatus) ?? 'all')
      return
    }
    setTab('sales')
    setSalesFilter((statusParam as SalesStatus | null) ?? 'all')
  }, [typeParam, statusParam])

  // 指示条动画：挂载后记录当前页签，并在下一帧把指示条释放到真实位置
  useEffect(() => {
    lastOrderTab = tab
    if (indicatorFrom === null) return
    const frame = requestAnimationFrame(() => setIndicatorFrom(null))
    return () => cancelAnimationFrame(frame)
  }, [tab, indicatorFrom])

  const switchTab = (next: OrderTab) => {
    setTab(next)
    setSalesFilter('all')
    setRecycleFilter('all')
    // 切换业务类型时把筛选落到 URL：详情返回后可还原，且 replace 不污染历史栈
    setParams({ type: next }, { replace: true })
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

  const recycleRows = DEMO_RECYCLE_ORDERS.filter((order) =>
    matchesRecycleTab(order.status, recycleFilter),
  )

  // 顶部直播提示：只在当前筛选结果里确有直播订单时出现
  const liveRecycleOrder =
    tab === 'recycle' ? recycleRows.find((order) => order.live === 'live') : undefined

  const filters = tab === 'sales' ? SALES_FILTERS : RECYCLE_TABS
  const activeFilter = tab === 'sales' ? salesFilter : recycleFilter

  const rebuy = (order: SalesOrder) => {
    order.lines.forEach((line) => addToCart(line.productId, line.variantId, line.quantity))
    navigate(paths.cart)
  }

  const payOrder = salesOrders.find((order) => order.id === payId)

  /** 支付成功：更新订单状态并进入统一的支付成功页 */
  const finishPay = (order: SalesOrder) => {
    moveOrder(order.id, 'pending-shipment')
    writeCheckoutResult({
      amount: salesTotal(order),
      count: salesCount(order),
      createdAt: Date.now(),
    })
    setPayId(null)
    navigate(paths.checkoutSuccess)
  }

  /** 待付款超时：金价波动大，超过 1 分钟自动取消 */
  const expirePay = (id: string) => {
    const target = salesOrders.find((order) => order.id === id)
    if (!target || target.status !== 'pending-payment') return
    moveOrder(id, 'cancelled')
    setPayId((current) => (current === id ? null : current))
    setToast('支付超时，订单已取消')
  }

  return (
    <ListPage title="订单" showBack onBack={() => navigate(paths.me)} contentClassName="space-y-3">
      <div className="-mx-4 flex items-center justify-between gap-3 px-4 pb-1">
        <div
          role="tablist"
          aria-label="订单类型"
          className="relative flex flex-1 items-end self-stretch"
        >
          {[
            { key: 'sales' as const, label: '购买订单' },
            { key: 'recycle' as const, label: '回收订单' },
          ].map((item) => {
            const active = tab === item.key
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchTab(item.key)}
                className={cn(
                  'flex-1 pb-1.5 pt-0 text-body transition-colors',
                  active
                    ? 'text-body-strong text-gold-800'
                    : 'text-muted-foreground active:text-foreground',
                )}
              >
                {item.label}
              </button>
            )
          })}
          {/* 指示条：按当前页签平滑滑动到对应半区 */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 flex">
            <span
              className={cn(
                'flex w-1/2 justify-center transition-transform duration-300 ease-out',
                indicatorTab === 'recycle' && 'translate-x-full',
              )}
            >
              <span className="h-0.5 w-6 rounded-full bg-gold-700" />
            </span>
          </span>
        </div>
      </div>

      {/* 状态下划线页签吸顶：滚长列表时始终可切换筛选 */}
      <div className="sticky top-0 z-20 -mx-4 -mt-3 bg-background/95 px-4 backdrop-blur">
        <SegmentedTabs
          items={filters.map((item) => ({ value: item.value, label: item.label }))}
          value={activeFilter}
          onChange={(value) => {
            if (tab === 'sales') {
              setSalesFilter(value as 'all' | SalesStatus)
              setParams({ type: 'sales', status: value }, { replace: true })
            } else {
              setRecycleFilter(value as RecycleTab)
              setParams({ type: 'recycle', status: value }, { replace: true })
            }
          }}
          variant="underline"
        />
      </div>

      {liveRecycleOrder ? (
        <button
          type="button"
          onClick={() => navigate(recycleOrderDetailPath(liveRecycleOrder.status))}
          className="flex w-full items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2 text-left"
        >
          <span className="flex min-w-0 items-center gap-2 text-caption text-foreground">
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
            <span className="truncate">{liveRecycleOrder.category}正在检测直播</span>
          </span>
          <span className="shrink-0 text-caption-strong text-gold-800">去观看 ›</span>
        </button>
      ) : null}

      {tab === 'sales' ? (
        salesRows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="暂无相关订单"
            action={
              <Button size="sm" variant="secondary" onClick={() => navigate(paths.buy)}>
                去看看商品
              </Button>
            }
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
                <p className="truncate text-caption text-subtle-foreground">{order.createdAt}</p>
                <div className="shrink-0 text-right">
                  <p className="text-caption text-subtle-foreground">共 {salesCount(order)} 件</p>
                  <p className="mt-0.5 text-body-strong text-gold-800">
                    合计 ¥{salesTotal(order).toLocaleString()}
                  </p>
                </div>
              </div>

              {order.status === 'pending-payment' && order.payDeadline ? (
                <CountdownBar
                  deadline={order.payDeadline}
                  tone="danger"
                  format="seconds"
                  onEnd={() => expirePay(order.id)}
                  text={(remaining) => (
                    <>
                      {'请在'}
                      <span className="tabular">{remaining}</span>
                      {'内完成支付，超时自动取消订单'}
                    </>
                  )}
                />
              ) : null}

              <div
                className="flex flex-wrap justify-end gap-2"
                onClick={(event) => event.stopPropagation()}
              >
                {order.status === 'pending-payment' ? (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => setCancelId(order.id)}>
                      取消订单
                    </Button>
                    <Button size="sm" onClick={() => setPayId(order.id)}>
                      立即支付
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
                    <Button size="sm" onClick={() => rebuy(order)}>
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
                  <Button size="sm" onClick={() => rebuy(order)}>
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
          description="预约回收后，检测与打款进度将在这里更新。"
          action={
            <Button size="sm" onClick={() => navigate(paths.quote)}>
              去回收预约
            </Button>
          }
        />
      ) : (
        recycleRows.map((order) => (
          <Card
            key={order.id}
            padding="sm"
            role="link"
            tabIndex={0}
            aria-label={`查看回收订单 ${order.id} 详情`}
            onClick={() => navigate(recycleOrderDetailPath(order.status))}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigate(recycleOrderDetailPath(order.status))
              }
            }}
            className="cursor-pointer space-y-3 transition active:bg-surface-2"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-body text-foreground">{order.category}</span>
                {order.live === 'live' ? <Badge tone="danger">直播中</Badge> : null}
                {order.live === 'upcoming' ? <Badge tone="info">即将开播</Badge> : null}
              </div>
              <RecycleStatusBadge status={order.status} />
            </div>

            <div className="flex items-end justify-between gap-3">
              <p className="text-caption text-subtle-foreground">{order.weight}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-caption text-subtle-foreground">预估价</span>
                <PriceText value={order.estimate} size="body" tone="gold" />
              </div>
            </div>

            {/* 异常与时效提示：待确认倒计时、检测直播、打款中、取消/关闭原因 */}
            {order.status === 'pending-confirm' && order.confirmRemainMin ? (
              <div className="flex items-center justify-between gap-3 rounded-sm bg-warning/8 px-3 py-2 ring-1 ring-warning/20">
                <span className="text-caption text-warning">检测完成，确认后立即打款</span>
                <ConfirmCountdown minutes={order.confirmRemainMin} />
              </div>
            ) : order.live === 'live' ? (
              <p className="rounded-sm bg-surface-2 px-3 py-2 text-caption text-subtle-foreground">
                检测全程直播，可随时进入观看
              </p>
            ) : order.status === 'pending-payment' ? (
              <p className="rounded-sm bg-surface-2 px-3 py-2 text-caption text-subtle-foreground">
                终价已确认，正在打款，预计 2 小时内到账
              </p>
            ) : order.closeReason ? (
              <p className="rounded-sm bg-surface-2 px-3 py-2 text-caption text-subtle-foreground">
                {order.closeReason}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-2.5">
              <p className="text-caption text-subtle-foreground">{order.createdAt}</p>
              <Button
                size="sm"
                onClick={(event) => {
                  event.stopPropagation()
                  navigate(recycleOrderDetailPath(order.status))
                }}
              >
                {RECYCLE_CARD_ACTION[order.status]}
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
          <Button block onClick={() => setTimeline(null)}>
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
                    <p className="mt-0.5 text-caption text-subtle-foreground">{step.description}</p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </BottomSheet>

      <PaymentPasswordSheet
        open={Boolean(payOrder)}
        amount={payOrder ? salesTotal(payOrder) : 0}
        onClose={() => setPayId(null)}
        onPaid={() => {
          if (payOrder) finishPay(payOrder)
        }}
      />

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </ListPage>
  )
}
