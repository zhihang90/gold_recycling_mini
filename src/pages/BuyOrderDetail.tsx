import {
  AddressCard,
  Button,
  Card,
  ConfirmDialog,
  CountdownBar,
  DetailPage,
  EmptyState,
  KeyValueRow,
  LogisticsSheet,
  MediaVisual,
  OrderStatusHeader,
  PaymentPasswordSheet,
  PriceText,
  SupportFab,
  Toast,
} from '@/components'
import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { maskPhone } from '@/mocks/addressBook'
import { addToCart } from '@/mocks/cart'
import { writeCheckoutResult } from '@/mocks/checkout'
import { findProduct } from '@/mocks/goldShop'
import { DEMO_LOGISTICS_GROUPS, formatShippingAddress, type LogisticsInfo } from '@/mocks/logistics'
import { feePerGram } from '@/mocks/pricing'
import {
  SALES_FILTERS,
  SALES_PAY_LABEL,
  SALES_STATUS_LABEL,
  SALES_STATUS_TONE,
  findSalesOrder,
  salesCount,
  salesTimeNow,
  salesTotal,
  updateSalesOrder,
  type SalesOrder,
  type SalesStatus,
} from '@/mocks/salesOrders'
import { paths } from '@/routes/paths'
import { useReviewState } from '@/lib/useReviewState'

/** 评审切换「待收货」时补一条演示运单，避免物流卡缺失 */
const DEMO_EXPRESS_FALLBACK = { company: '顺丰速运', no: 'SF1234567890123' }

/** 底部操作标识：具体文案、样式与行为集中在视图内实现 */
type OrderAction = 'cancel' | 'pay' | 'viewLogistics' | 'confirmReceipt' | 'rebuy'

/**
 * 各状态的页面结构配置：结构差异只看这张表，不再散落在 JSX 条件里。
 * 新增/调整某个状态时只改对应一行，不影响其它状态。
 */
interface StatusView {
  /** 底部操作按钮，按顺序展示 */
  actions: OrderAction[]
}

const STATUS_VIEWS: Record<SalesStatus, StatusView> = {
  'pending-payment': { actions: ['cancel', 'pay'] },
  'pending-shipment': { actions: [] },
  'pending-receipt': { actions: ['viewLogistics', 'confirmReceipt'] },
  completed: { actions: ['viewLogistics', 'rebuy'] },
  cancelled: { actions: ['rebuy'] },
  'after-sale': { actions: ['viewLogistics'] },
}

/** 订单状态 → 订单列表对应的分类筛选；列表没有该筛选（如已取消）时回到全部 */
function ordersListPath(status: SalesStatus) {
  const filter = SALES_FILTERS.some((item) => item.value === status) ? status : 'all'
  return `${paths.orders}?type=sales&status=${filter}`
}

/** 商品信息卡：与状态无关，所有订单详情共用 */
function OrderGoodsCard({ order }: { order: SalesOrder }) {
  return (
    <Card padding="md" className="space-y-3">
      <p className="text-body-strong text-foreground">商品信息</p>
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
              <p className="mt-1 text-caption text-subtle-foreground">
                单价 ¥{line.price.toLocaleString()}
                {product ? `（含工费 ${feePerGram(product.grams)} 元/克）` : ''}
              </p>
            </div>
            <PriceText
              value={line.price * line.quantity}
              size="body"
              tone="price"
              className="shrink-0"
            />
          </div>
        )
      })}
    </Card>
  )
}

/** 买金订单详情：收货、商品、金额与支付信息均来自确认订单页 */
export function BuyOrderDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { orderId } = useParams()
  const [order, setOrder] = useState<SalesOrder | undefined>(() =>
    orderId ? findSalesOrder(orderId) : undefined,
  )
  /** 从确认订单页取消支付跳到详情时，返回键应落到订单列表，而不是结算流程 */
  const fromCheckout = Boolean((location.state as { fromCheckout?: boolean } | null)?.fromCheckout)

  // 订单详情之间切换时同步重新读取，避免沿用上一笔订单的状态
  useEffect(() => {
    setOrder(orderId ? findSalesOrder(orderId) : undefined)
  }, [orderId])

  // 桌面评审面板：可原地切换订单状态与「订单不存在」兜底
  const review = useReviewState('orders.detail')
  const reviewStatus = review.values.status
  const missing = review.values.data === 'missing'

  if (!order || missing) {
    return (
      <DetailPage title="订单详情">
        <EmptyState
          icon={ClipboardList}
          title="订单不存在"
          description="该订单可能已被删除，请返回订单列表查看。"
          action={<Button onClick={() => navigate(paths.orders)}>返回订单列表</Button>}
        />
      </DetailPage>
    )
  }

  const override = reviewStatus !== 'auto'
  const displayed: SalesOrder = override
    ? {
        ...order,
        status: reviewStatus as SalesStatus,
        express:
          order.express ?? (reviewStatus === 'pending-receipt' ? DEMO_EXPRESS_FALLBACK : undefined),
      }
    : order

  return (
    <BuyOrderDetailView
      order={displayed}
      onOrderChange={setOrder}
      persist={!override}
      onBack={
        fromCheckout
          ? () => navigate(ordersListPath(displayed.status), { replace: true })
          : undefined
      }
    />
  )
}

/**
 * 订单详情主体：真实订单与「按状态的演示页」共用同一套内容与操作。
 * 结构差异由 STATUS_VIEWS 配置声明，状态特有的区块通过独立组件组合。
 * persist 为 true 时操作写回会话订单；演示状态页只改当前页面，保证每次进入都是同一状态。
 */
export function BuyOrderDetailView({
  order,
  onOrderChange,
  persist = false,
  onBack,
}: {
  order: SalesOrder
  onOrderChange: (order: SalesOrder) => void
  persist?: boolean
  /** 自定义返回行为：默认按浏览器历史回退 */
  onBack?: () => void
}) {
  const navigate = useNavigate()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [logisticsOpen, setLogisticsOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const total = salesTotal(order)
  const count = salesCount(order)
  /** 已支付：有待付款以外的状态且存在支付时间；评审切到待付款时不展示支付信息 */
  const showPaid = Boolean(order.paidAt) && order.status !== 'pending-payment'
  const view = STATUS_VIEWS[order.status]

  /** 物流弹层数据：与订单列表共用同一份演示轨迹，缺运单时用演示单号兜底 */
  const logisticsInfo: LogisticsInfo = {
    carrier: order.express?.company ?? DEMO_EXPRESS_FALLBACK.company,
    trackingNo: order.express?.no ?? DEMO_EXPRESS_FALLBACK.no,
    address: formatShippingAddress(order.address),
    groups: DEMO_LOGISTICS_GROUPS,
  }

  const applyStatus = (status: SalesStatus, patch: Partial<SalesOrder> = {}) => {
    if (!persist) {
      onOrderChange({ ...order, status, ...patch })
      return
    }
    const next = updateSalesOrder(order.id, { status, ...patch })
    if (next) onOrderChange(next)
  }

  const copyTracking = async (trackingNo: string) => {
    if (!trackingNo) return
    await navigator.clipboard?.writeText(trackingNo)
    setToast('运单号已复制')
  }

  const rebuy = () => {
    order.lines.forEach((line) => addToCart(line.productId, line.variantId, line.quantity))
    navigate(paths.cart)
  }

  const pay = () => {
    applyStatus('pending-shipment', { paidAt: salesTimeNow() })
    writeCheckoutResult({ amount: total, count, createdAt: Date.now() })
    navigate(paths.checkoutSuccess, { replace: true })
  }

  /** 待付款超时：金价波动大，超过 1 分钟自动取消 */
  const expirePay = () => {
    if (order.status !== 'pending-payment') return
    applyStatus('cancelled')
    setPayOpen(false)
    setToast('支付超时，订单已取消')
  }

  /** 操作标识 → 按钮文案、样式与行为；状态配置只引用标识 */
  const actionMap: Record<
    OrderAction,
    { label: string; variant?: 'secondary'; onClick: () => void }
  > = {
    cancel: { label: '取消订单', variant: 'secondary', onClick: () => setCancelOpen(true) },
    pay: { label: '立即支付', onClick: () => setPayOpen(true) },
    viewLogistics: {
      label: '查看物流',
      variant: 'secondary',
      onClick: () => setLogisticsOpen(true),
    },
    confirmReceipt: {
      label: '确认收货',
      onClick: () => setReceiptOpen(true),
    },
    rebuy: { label: '再次购买', onClick: rebuy },
  }

  const footer =
    view.actions.length > 0 ? (
      <div className={view.actions.length > 1 ? 'grid grid-cols-2 gap-2' : undefined}>
        {view.actions.map((action) => {
          const { label, variant, onClick } = actionMap[action]
          return (
            <Button key={action} block variant={variant} onClick={onClick}>
              {label}
            </Button>
          )
        })}
      </div>
    ) : undefined

  return (
    <DetailPage title="订单详情" footer={footer} onBack={onBack}>
      <OrderStatusHeader
        status={SALES_STATUS_LABEL[order.status]}
        note={`共 ${count} 件商品 · 合计 ¥${total.toLocaleString()}`}
        tone={SALES_STATUS_TONE[order.status]}
      />

      {order.status === 'pending-payment' && order.payDeadline ? (
        <CountdownBar
          deadline={order.payDeadline}
          tone="danger"
          format="seconds"
          onEnd={expirePay}
          text={(remaining) => (
            <>
              {'请在'}
              <span className="tabular">{remaining}</span>
              {'内完成支付，超时自动取消订单'}
            </>
          )}
        />
      ) : null}

      {order.address ? (
        <AddressCard
          name={order.address.name}
          phone={maskPhone(order.address.phone)}
          region={order.address.region}
          detail={`${order.address.place} ${order.address.doorNo}`.trim()}
        />
      ) : null}

      <OrderGoodsCard order={order} />

      <Card padding="md">
        <KeyValueRow label="配送方式" value="顺丰速运" />
        <KeyValueRow label="备注" value={order.note || '无'} />
      </Card>

      <Card padding="md">
        <KeyValueRow label="商品总价" value={<PriceText value={total} size="body" tone="ink" />} />
        <KeyValueRow label="运费" value={<PriceText value={0} size="body" tone="ink" />} />
        <div className="mt-1 flex items-center justify-between border-t border-border-subtle pt-3">
          <span className="text-body text-foreground">应付金额</span>
          <PriceText value={total} size="section" tone="price" />
        </div>
      </Card>

      <Card padding="md">
        <KeyValueRow label="订单号" value={<span className="tabular">{order.id}</span>} />
        <KeyValueRow label="下单时间" value={order.createdAt} />
        {showPaid ? (
          <KeyValueRow
            label="支付金额"
            value={<PriceText value={total} size="body" tone="ink" />}
          />
        ) : null}
        <KeyValueRow
          label="支付方式"
          value={showPaid && order.payMethod ? SALES_PAY_LABEL[order.payMethod] : '未选择'}
        />
        {showPaid ? <KeyValueRow label="支付时间" value={order.paidAt} /> : null}
      </Card>

      <ConfirmDialog
        open={cancelOpen}
        title="取消订单"
        description="待付款订单取消后立即关闭，不会扣款；需要时可在订单中再次购买。"
        cancelText="再想想"
        confirmText="确认取消"
        tone="danger"
        onConfirm={() => {
          applyStatus('cancelled')
          setCancelOpen(false)
          setToast('订单已取消')
        }}
        onClose={() => setCancelOpen(false)}
      />

      <ConfirmDialog
        open={receiptOpen}
        title="确认收货"
        description="请确认已收到商品并检查无误。确认收货后订单将完成，该操作不可撤销。"
        cancelText="再想想"
        confirmText="确认收货"
        onConfirm={() => {
          applyStatus('completed')
          setReceiptOpen(false)
          setToast('已确认收货')
        }}
        onClose={() => setReceiptOpen(false)}
      />

      <PaymentPasswordSheet
        open={payOpen}
        amount={total}
        channel={SALES_PAY_LABEL[order.payMethod ?? 'wechat']}
        onClose={() => setPayOpen(false)}
        onPaid={() => {
          setPayOpen(false)
          pay()
        }}
      />

      <LogisticsSheet
        open={logisticsOpen}
        info={logisticsInfo}
        onCopy={copyTracking}
        onClose={() => setLogisticsOpen(false)}
      />

      <SupportFab />

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}
