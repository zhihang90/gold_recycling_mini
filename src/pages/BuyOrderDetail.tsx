import {
  AddressCard,
  BottomSheet,
  Button,
  Card,
  DetailPage,
  EmptyState,
  KeyValueRow,
  MediaVisual,
  OrderStatusHeader,
  PaymentPasswordSheet,
  PriceText,
  StatusTimeline,
  TextLink,
  Toast,
  type TimelineItem,
} from '@/components'
import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { maskPhone } from '@/mocks/addressBook'
import { addToCart } from '@/mocks/cart'
import { findProduct } from '@/mocks/goldShop'
import {
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

const LOGISTICS_STEPS: TimelineItem[] = [
  {
    key: 'picked',
    title: '已揽收',
    description: '顺丰速运深圳南山集散中心',
    state: 'done',
  },
  {
    key: 'transit',
    title: '运输中',
    description: '快件已发出，正在运往收货城市',
    state: 'done',
  },
  {
    key: 'delivering',
    title: '派送中',
    description: '快递员正在派送，请保持电话畅通',
    state: 'current',
  },
]

/** 买金订单详情：收货、商品、金额与支付信息均来自确认订单页 */
export function BuyOrderDetailPage() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [order, setOrder] = useState<SalesOrder | undefined>(() =>
    orderId ? findSalesOrder(orderId) : undefined,
  )

  // 订单详情之间切换时同步重新读取，避免沿用上一笔订单的状态
  useEffect(() => {
    setOrder(orderId ? findSalesOrder(orderId) : undefined)
  }, [orderId])

  if (!order) {
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

  return <BuyOrderDetailView order={order} onOrderChange={setOrder} persist />
}

/**
 * 订单详情主体：真实订单与「按状态的演示页」共用同一套内容与操作。
 * persist 为 true 时操作写回会话订单；演示状态页只改当前页面，保证每次进入都是同一状态。
 */
export function BuyOrderDetailView({
  order,
  onOrderChange,
  persist = false,
}: {
  order: SalesOrder
  onOrderChange: (order: SalesOrder) => void
  persist?: boolean
}) {
  const navigate = useNavigate()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const total = salesTotal(order)
  const count = salesCount(order)

  const applyStatus = (status: SalesStatus, patch: Partial<SalesOrder> = {}) => {
    if (!persist) {
      onOrderChange({ ...order, status, ...patch })
      return
    }
    const next = updateSalesOrder(order.id, { status, ...patch })
    if (next) onOrderChange(next)
  }

  const contact = () => setToast('客服将在 9:00–21:00 回复')

  const copyExpress = async () => {
    if (!order.express) return
    await navigator.clipboard?.writeText(order.express.no)
    setToast('运单号已复制')
  }

  const rebuy = () => {
    order.lines.forEach((line) => addToCart(line.productId, line.variantId, line.quantity))
    navigate(paths.cart)
  }

  const pay = () => {
    applyStatus('pending-shipment', { paidAt: salesTimeNow() })
    setToast('支付成功，等待发货')
  }

  const footer = (() => {
    switch (order.status) {
      case 'pending-payment':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" block onClick={() => setCancelOpen(true)}>
              取消订单
            </Button>
            <Button block onClick={() => setPayOpen(true)}>
              立即付款
            </Button>
          </div>
        )
      case 'pending-receipt':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" block onClick={contact}>
              联系客服
            </Button>
            <Button
              block
              onClick={() => {
                applyStatus('completed')
                setToast('已确认收货')
              }}
            >
              确认收货
            </Button>
          </div>
        )
      case 'completed':
        return (
          <Button block onClick={rebuy}>
            再次购买
          </Button>
        )
      case 'cancelled':
        return (
          <Button block onClick={rebuy}>
            再次购买
          </Button>
        )
      default:
        return (
          <Button variant="secondary" block onClick={contact}>
            联系客服
          </Button>
        )
    }
  })()

  return (
    <DetailPage title="订单详情" footer={footer}>
      <OrderStatusHeader
        status={SALES_STATUS_LABEL[order.status]}
        note={`共 ${count} 件商品 · 合计 ¥${total.toLocaleString()}`}
        tone={SALES_STATUS_TONE[order.status]}
      />

      {order.address ? (
        <AddressCard
          name={order.address.name}
          phone={maskPhone(order.address.phone)}
          region={order.address.region}
          detail={`${order.address.place} ${order.address.doorNo}`.trim()}
        />
      ) : null}

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

      {order.status === 'pending-receipt' && order.express ? (
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-body-strong text-foreground">物流信息</p>
            <span className="text-caption text-subtle-foreground">
              {order.express.company}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2">
            <span className="tabular text-body text-foreground">{order.express.no}</span>
            <TextLink onClick={copyExpress}>复制</TextLink>
          </div>
          <StatusTimeline items={LOGISTICS_STEPS} />
        </Card>
      ) : null}

      <Card padding="md">
        {order.status === 'pending-receipt' && order.express ? null : (
          <KeyValueRow label="配送方式" value="顺丰速运" />
        )}
        <KeyValueRow label="备注" value={order.note || '无'} />
      </Card>

      <Card padding="md">
        <KeyValueRow
          label="商品总额"
          value={<PriceText value={total} size="body" tone="ink" />}
        />
        <KeyValueRow label="运费" value={<PriceText value={0} size="body" tone="ink" />} />
        <div className="mt-1 flex items-center justify-between border-t border-border-subtle pt-3">
          <span className="text-body text-foreground">
            {order.status === 'pending-payment' ? '应付款' : '实付款'}
          </span>
          <PriceText value={total} size="section" tone="price" />
        </div>
      </Card>

      <Card padding="md">
        <KeyValueRow label="订单号" value={<span className="tabular">{order.id}</span>} />
        <KeyValueRow label="下单时间" value={order.createdAt} />
        <KeyValueRow
          label="支付方式"
          value={order.payMethod ? SALES_PAY_LABEL[order.payMethod] : '未选择'}
        />
        {order.paidAt ? <KeyValueRow label="支付时间" value={order.paidAt} /> : null}
      </Card>

      <BottomSheet
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="取消订单"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" block onClick={() => setCancelOpen(false)}>
              再想想
            </Button>
            <Button
              variant="danger"
              block
              onClick={() => {
                applyStatus('cancelled')
                setCancelOpen(false)
                setToast('订单已取消')
              }}
            >
              确认取消
            </Button>
          </div>
        }
      >
        <p className="text-body text-muted-foreground">
          待付款订单取消后立即关闭，不会扣款；需要时可在订单详情中再次购买。
        </p>
      </BottomSheet>

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

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}
