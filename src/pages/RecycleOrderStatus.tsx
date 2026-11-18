import { ClipboardList } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  BottomSheet,
  Button,
  Card,
  DetailPage,
  EmptyState,
  KeyValueRow,
  OrderStatusHeader,
  PriceText,
  StatusSteps,
  TextLink,
  Toast,
} from '@/components'
import {
  DEMO_RECYCLE_ORDERS,
  RECYCLE_STATUS_LABEL,
  RECYCLE_STATUS_TONE,
  RECYCLE_STEPS,
  type RecycleOrder,
  type RecycleStatus,
} from '@/mocks/recycleOrders'
import { paths } from '@/routes/paths'

/** 每个状态的补充说明，补齐「为什么停在这一步」 */
const STATUS_REASON: Record<RecycleStatus, string> = {
  'pending-ship': '顺丰取件已预约，请提前打包好待回收物品',
  testing: '物品已到仓检测，预计 2 小时内出结果',
  'pending-confirm': '检测已完成，请确认最终回收报价',
  'pending-payment': '报价已确认，款项正在结算',
  completed: '回收款已到账，感谢您的信任',
}

/**
 * 回收订单详情（按状态）：路由末段即订单状态，用固定的演示订单渲染。
 * 待寄出 / 检测中 / 待确认 / 待打款 / 已完成 各占一条独立路由，便于评审逐状态查看。
 */
export function RecycleOrderStatusPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const status = pathname.split('/').pop() as RecycleStatus
  const [order, setOrder] = useState<RecycleOrder | undefined>(() =>
    DEMO_RECYCLE_ORDERS.find((item) => item.status === status),
  )
  const [rejectOpen, setRejectOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // 状态页之间切换时重新取演示订单
  useEffect(() => {
    setOrder(DEMO_RECYCLE_ORDERS.find((item) => item.status === status))
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

  const currentIndex = Math.max(
    RECYCLE_STEPS.findIndex((step) => step.key === order.status),
    0,
  )

  /** 确认报价：本页直接推进到待打款，方便评审看到下一状态的形态 */
  const confirmQuote = () => {
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            status: 'pending-payment',
            payment: {
              account: prev.payment?.account ?? '平安银行 **** 9455',
              amount: prev.inspection?.amount ?? prev.estimate,
              eta: '预计 2 小时内到账',
            },
          }
        : prev,
    )
    setToast('已确认报价，款项将尽快到账')
  }

  const footer = (() => {
    if (order.status === 'pending-ship') {
      return (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" block onClick={() => setToast('已提交取消申请，客服将与您联系')}>
            取消订单
          </Button>
          <Button block onClick={() => setToast('取件时间已修改，快递员将按新时间上门')}>
            修改取件时间
          </Button>
        </div>
      )
    }
    if (order.status === 'pending-confirm') {
      return (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" block onClick={() => setRejectOpen(true)}>
            不接受报价
          </Button>
          <Button block onClick={confirmQuote}>
            确认报价
          </Button>
        </div>
      )
    }
    if (order.status === 'completed') {
      return (
        <Button block onClick={() => navigate(paths.quote)}>
          再次回收
        </Button>
      )
    }
    return (
      <Button variant="secondary" block onClick={() => setToast('客服将在 9:00–21:00 回复')}>
        联系客服
      </Button>
    )
  })()

  return (
    <DetailPage
      title="订单详情"
      footer={footer}
      stickyBar={
        <div className="px-4 py-3">
          <StatusSteps
            steps={RECYCLE_STEPS.map((step) => ({ key: step.key, label: step.label }))}
            currentIndex={currentIndex}
          />
        </div>
      }
    >
      <OrderStatusHeader
        status={RECYCLE_STATUS_LABEL[order.status]}
        reason={STATUS_REASON[order.status]}
        note={<span className="tabular">订单号 {order.id}</span>}
        tone={RECYCLE_STATUS_TONE[order.status]}
      />

      <Card padding="md">
        <KeyValueRow label="回收品类" value={order.category} />
        <KeyValueRow label="预估克重" value={<span className="tabular">{order.weight}</span>} />
        <KeyValueRow label="成色" value={order.purity} />
        <KeyValueRow label="黄金来源" value={order.source} />
        {order.inspection ? null : (
          <div className="mt-1 flex items-center justify-between border-t border-border-subtle pt-3">
            <span className="text-body text-foreground">预估回收金额</span>
            <PriceText value={order.estimate} size="section" tone="price" />
          </div>
        )}
      </Card>

      {order.status === 'pending-ship' && order.pickup ? (
        <Card padding="md" className="space-y-3">
          <p className="text-body-strong text-foreground">取件信息</p>
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-caption text-muted-foreground ring-1 ring-border-subtle">
              寄
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body-strong text-foreground">
                {order.pickup.name}{' '}
                <span className="ml-1 text-caption tabular text-subtle-foreground">
                  {order.pickup.phone}
                </span>
              </p>
              <p className="mt-0.5 text-caption text-muted-foreground">
                {order.pickup.region} {order.pickup.detail}
              </p>
            </div>
          </div>
          <div className="rounded-md bg-gold-50 px-3 py-2 text-caption tabular text-gold-800 ring-1 ring-gold-200">
            上门时间：{order.pickup.window}
          </div>
          <p className="text-caption text-subtle-foreground">
            已为您自动投保太平洋保险，取件期间请勿自行保价或投保；回收满 20 克减免运保费。
          </p>
        </Card>
      ) : null}

      {order.status === 'testing' ? (
        <Card padding="md" className="space-y-2">
          <p className="text-body-strong text-foreground">检测信息</p>
          <KeyValueRow label="检测机构" value={order.center ?? '南京国检中心'} />
          <KeyValueRow label="检测项目" value="称重 · 成色 · 真伪" />
          <KeyValueRow label="预计完成" value="2 小时内出结果" />
          <p className="rounded-md bg-surface-2 px-3 py-2 text-caption text-muted-foreground">
            检测过程可能对物品造成不可逆的外观改变，属于行业标准做法，请知悉后耐心等待结果。
          </p>
        </Card>
      ) : null}

      {order.status === 'pending-confirm' && order.inspection ? (
        <Card padding="md" className="space-y-2">
          <p className="text-body-strong text-foreground">检测结果</p>
          <KeyValueRow
            label="检测克重"
            value={
              <span className="tabular">
                {order.inspection.weight}（预估 {order.weight}）
              </span>
            }
          />
          <KeyValueRow label="检测成色" value={order.inspection.purity} />
          <KeyValueRow label="检测机构" value={order.center ?? '南京国检中心'} />
          <KeyValueRow
            label="检测完成"
            value={<span className="tabular">{order.inspection.finishedAt}</span>}
          />
          <div className="flex items-end justify-between border-t border-border-subtle pt-3">
            <span className="text-body text-foreground">最终回收金额</span>
            <PriceText value={order.inspection.amount} size="section" tone="price" />
          </div>
          <p className="text-caption text-muted-foreground">
            确认后 2 小时内打款；不接受报价将安排原物退回，退回运费由平台承担。
          </p>
        </Card>
      ) : null}

      {order.status === 'pending-payment' ? (
        <Card padding="md" className="space-y-2">
          <p className="text-body-strong text-foreground">打款信息</p>
          <div className="flex items-end justify-between">
            <span className="text-body text-foreground">最终回收金额</span>
            <PriceText
              value={order.payment?.amount ?? order.inspection?.amount ?? order.estimate}
              size="title"
              tone="price"
            />
          </div>
          <KeyValueRow label="收款账户" value={order.payment?.account ?? '平安银行 **** 9455'} />
          <KeyValueRow label="打款时效" value={order.payment?.eta ?? '确认后 2 小时内到账'} />
          <p className="rounded-md bg-gold-50 px-3 py-2 text-caption text-gold-800 ring-1 ring-gold-200">
            款项由安盛华黄金回收通过对公账户转出，到账时间以收款银行入账为准。
          </p>
        </Card>
      ) : null}

      {order.status === 'completed' ? (
        <Card padding="md" className="space-y-2">
          <p className="text-body-strong text-foreground">打款完成</p>
          <div className="flex items-end justify-between">
            <span className="text-body text-foreground">到账金额</span>
            <PriceText
              value={order.payment?.amount ?? order.inspection?.amount ?? order.estimate}
              size="title"
              tone="price"
            />
          </div>
          <KeyValueRow
            label="到账时间"
            value={<span className="tabular">{order.payment?.paidAt ?? '—'}</span>}
          />
          <KeyValueRow label="收款账户" value={order.payment?.account ?? '平安银行 **** 9455'} />
          <TextLink
            onClick={() => setToast('电子回单已生成，可在收款银行查看')}
            showArrow
            className="text-caption"
          >
            查看电子回单
          </TextLink>
        </Card>
      ) : null}

      <Card padding="md">
        <KeyValueRow label="订单编号" value={<span className="tabular">{order.id}</span>} />
        <KeyValueRow
          label="下单时间"
          value={<span className="tabular">{order.createdAt}</span>}
        />
        <KeyValueRow label="回收方式" value={order.method} />
        <KeyValueRow label="检测机构" value={order.center ?? '南京国检中心'} />
      </Card>

      <BottomSheet
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="不接受报价"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" block onClick={() => setRejectOpen(false)}>
              再想想
            </Button>
            <Button
              variant="danger"
              block
              onClick={() => {
                setRejectOpen(false)
                setToast('已提交退回申请，客服将与您确认退回方式')
              }}
            >
              确认退回
            </Button>
          </div>
        }
      >
        <p className="text-body text-muted-foreground">
          退回物品将按原地址寄回，运费由平台承担；如需重新检测，可联系客服重新预约。
        </p>
      </BottomSheet>

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}
