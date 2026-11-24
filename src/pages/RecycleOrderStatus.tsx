import { ClipboardList, Phone } from 'lucide-react'
import { useEffect, useState, type ComponentType } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import {
  Badge,
  BottomSheet,
  Button,
  Card,
  DetailPage,
  EmptyState,
  IconButton,
  InlineNotice,
  KeyValueRow,
  MediaVisual,
  OrderStatusHeader,
  PriceText,
  StatusSteps,
  StatusTimeline,
  TextLink,
  Toast,
} from '@/components'
import { images } from '@/assets/images'
import {
  DEMO_RECYCLE_ORDERS,
  RECYCLE_STAGES,
  RECYCLE_STATUS_LABEL,
  RECYCLE_STATUS_TONE,
  recycleStageOf,
  type RecycleOrder,
  type RecycleStatus,
} from '@/mocks/recycleOrders'
import { paths, routePath } from '@/routes/paths'

const DEFAULT_CENTER = '安盛华集团检测中心'

/** 每个状态的补充说明，补齐「为什么停在这一步」；待确认的倒计时在页面内动态拼接 */
const STATUS_REASON: Partial<Record<RecycleStatus, string>> = {
  review: '平台正在审核您的订单，请耐心等待',
  'pending-ship': '审核已通过，请尽快寄出物品',
  'pending-receipt': '快件已揽收，正在寄往检测中心',
  testing: '物品已到仓检测，预计 2 小时内出结果',
  'pending-payment': '终价已确认，款项正在打款',
  completed: '回收款已到账，感谢您的信任',
  cancelled: '订单已取消，未产生任何费用',
  closed: '订单已关闭，物品已按原地址退回',
}

/** 状态专属详情卡：审核中不展示校验细节，其余状态各自成独立区块 */
type RecycleDetailCard = 'testing' | 'inspection' | 'payment' | 'paid' | 'closed'

/** 底部操作标识：文案、样式与行为集中在视图内实现 */
type RecycleOrderAction =
  'cancel' | 'changePickup' | 'reject' | 'confirm' | 'contact' | 'recycleAgain'

/**
 * 各状态的页面结构配置：结构差异只看这张表，不再散落在 JSX 条件里。
 * 新增/调整某个状态时只改对应一行，不影响其它状态。
 */
interface StatusView {
  /** 状态专属详情卡；缺省时只展示通用信息 */
  card?: RecycleDetailCard
  /** 底部操作按钮，按顺序展示 */
  actions: RecycleOrderAction[]
}

const STATUS_VIEWS: Record<RecycleStatus, StatusView> = {
  review: { actions: ['contact'] },
  'pending-ship': { actions: ['cancel', 'changePickup'] },
  'pending-receipt': { actions: ['contact'] },
  testing: { card: 'testing', actions: ['contact'] },
  'pending-confirm': { card: 'inspection', actions: ['reject', 'confirm'] },
  'pending-payment': { card: 'payment', actions: ['contact'] },
  completed: { card: 'paid', actions: ['recycleAgain'] },
  cancelled: { card: 'closed', actions: ['recycleAgain'] },
  closed: { card: 'closed', actions: ['contact'] },
}

interface DetailCardProps {
  order: RecycleOrder
  onToast: (message: string) => void
}

/** 演示参数：?state= 覆盖直播三态 / 打款失败分支；?reason= 细分失败原因 */
function useRecycleScene() {
  const [searchParams] = useSearchParams()
  return { state: searchParams.get('state'), reason: searchParams.get('reason') }
}

/** 从文案里的数字解析出数值，用于差异对比 */
function parseNum(value: string) {
  return Number.parseFloat(value.replace(/[^0-9.]/g, '')) || 0
}

/** 直播三态：URL ?state= 优先，其次取订单 fixture 的 live 字段 */
function resolveLive(
  scene: string | null,
  fallback: RecycleOrder['live'],
): 'live' | 'upcoming' | 'replay' {
  if (scene === 'live' || scene === 'upcoming' || scene === 'replay') return scene
  return fallback ?? 'upcoming'
}

/** 已关闭原因分类：与 spec 3.7 最终状态分类对齐 */
function closeCategoryOf(reason?: string): {
  label: string
  tone: 'neutral' | 'warning' | 'danger' | 'info'
} {
  if (!reason) return { label: '订单已关闭', tone: 'neutral' }
  if (reason.includes('拒绝终价')) return { label: '拒绝终价退回', tone: 'warning' }
  if (reason.includes('拒收')) return { label: '拒收退回', tone: 'warning' }
  if (reason.includes('拦截') || reason.includes('物流'))
    return { label: '拦截 / 物流异常关闭', tone: 'warning' }
  if (reason.includes('支付')) return { label: '支付异常关闭', tone: 'danger' }
  if (reason.includes('风控') || reason.includes('无法继续'))
    return { label: '风控终止', tone: 'danger' }
  if (reason.includes('取消')) return { label: '用户取消', tone: 'neutral' }
  return { label: '订单已关闭', tone: 'neutral' }
}

/** 检测中：检测直播三态（即将开始 / 直播中 / 视频回看）＋检测信息 */
function TestingCard({ order }: DetailCardProps) {
  const scene = useRecycleScene()
  const live = resolveLive(scene.state, order.live)

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-body-strong text-foreground">检测直播</p>
        {live === 'live' ? (
          <Badge tone="danger">直播中</Badge>
        ) : live === 'upcoming' ? (
          <Badge tone="info">即将开始</Badge>
        ) : (
          <Badge tone="neutral">视频回看</Badge>
        )}
      </div>

      {live === 'live' ? (
        <div className="relative overflow-hidden rounded-lg ring-1 ring-border-subtle">
          <MediaVisual
            src={images.heroLive}
            alt="检测直播画面"
            className="h-44 w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink-900/45" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-end px-2 py-1.5 text-caption text-primary-foreground">
            <span>画面有数秒延迟</span>
          </div>
        </div>
      ) : live === 'upcoming' ? (
        <InlineNotice tone="info" title="检测即将开始">
          检测排程：今日 14:30 开始；开始前 30
          分钟将推送通知，点击即可进入观看，检测不会早于通知时间开始。
        </InlineNotice>
      ) : (
        <div className="overflow-hidden rounded-lg ring-1 ring-border-subtle">
          <MediaVisual
            src={images.heroLive}
            alt="检测回看画面"
            className="h-32 w-full object-cover"
          />
          <div className="flex items-center justify-between bg-surface-2 px-3 py-2 text-caption text-muted-foreground">
            <span>检测全程录像 · 已生成回看</span>
            <span>保存 3 年 · 检测完成后可下载</span>
          </div>
        </div>
      )}

      <p className="rounded-md bg-surface-2 px-3 py-2 text-caption text-muted-foreground">
        直播仅订单本人可见，画面叠加时间戳水印；推流异常时切换为纯录像模式，检测完成后提供完整视频，证据链不中断。
      </p>

      <div>
        <p className="text-body-strong text-foreground">检测信息</p>
        <KeyValueRow label="检测机构" value={order.center ?? DEFAULT_CENTER} />
        <KeyValueRow label="检测项目" value="称重 · 成色 · 真伪" />
        <KeyValueRow label="预计完成" value="2 小时内出结果" />
      </div>
      <p className="text-caption text-muted-foreground">
        检测过程可能对物品造成不可逆的外观改变，属于行业标准做法，请知悉后耐心等待结果。
      </p>
    </Card>
  )
}

/** 检测视频下载：检测完成后各状态统一提供 */
function VideoDownloadLink({ onToast }: { onToast: (message: string) => void }) {
  return (
    <TextLink onClick={() => onToast('检测视频已开始下载')} showArrow className="text-caption">
      下载检测视频
    </TextLink>
  )
}

/** 每秒刷新的剩余时间（mm:ss），用于把倒计时并入状态说明文案 */
function useRemainingText(deadline: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const total = Math.max(0, Math.floor((deadline - now) / 1000))
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

/** 待确认：预估 vs 终价差异对比 ＋ 结算时点 */
function InspectionCard({ order, onToast }: DetailCardProps) {
  const inspection = order.inspection
  if (!inspection) return null

  const weightDiff = parseNum(inspection.weight) - parseNum(order.weight)
  const amountDiff = inspection.amount - order.estimate
  const toneFor = (value: number) =>
    value < 0 ? 'text-destructive' : value > 0 ? 'text-success' : 'text-muted-foreground'

  const diffRows = [
    {
      label: '克重',
      estimate: order.weight,
      actual: inspection.weight,
      diff: `${weightDiff > 0 ? '+' : ''}${weightDiff.toFixed(2)}g`,
      tone: toneFor(weightDiff),
    },
    {
      label: '金额',
      estimate: `¥${order.estimate}`,
      actual: `¥${inspection.amount}`,
      diff: `${amountDiff > 0 ? '+' : '-'}¥${Math.abs(amountDiff)}`,
      tone: toneFor(amountDiff),
    },
  ]

  return (
    <Card padding="md" className="space-y-3">
      <p className="text-body-strong text-foreground">终价差异对比</p>
      <div className="overflow-hidden rounded-md ring-1 ring-border-subtle">
        <div className="grid grid-cols-4 bg-surface-2 px-2 py-2 text-caption text-muted-foreground">
          <span>项目</span>
          <span className="text-right">预估</span>
          <span className="text-right">检测</span>
          <span className="text-right">差异</span>
        </div>
        {diffRows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-4 border-t border-border-subtle px-2 py-2 text-body"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className="tabular text-right text-foreground">{row.estimate}</span>
            <span className="tabular text-right text-foreground">{row.actual}</span>
            <span className={`tabular text-right ${row.tone}`}>{row.diff}</span>
          </div>
        ))}
      </div>

      <p className="text-caption text-muted-foreground">
        差异说明：克重为去除挂绳、焊点后的净重，成色以火试金实测为准；终价按检测完成时点的结算金价核算。
      </p>

      <div className="rounded-md bg-surface-2 px-3 py-1">
        <KeyValueRow
          label="结算金价时点"
          value={<span className="tabular">{inspection.finishedAt}</span>}
        />
      </div>

      <div>
        <KeyValueRow
          label="检测克重"
          value={<span className="tabular">{inspection.weight}</span>}
        />
        <KeyValueRow label="检测成色" value={inspection.purity} />
        <KeyValueRow label="检测机构" value={order.center ?? DEFAULT_CENTER} />
        <KeyValueRow
          label="检测完成"
          value={<span className="tabular">{inspection.finishedAt}</span>}
        />
        <KeyValueRow label="检测录像" value={<VideoDownloadLink onToast={onToast} />} />
      </div>

      <div className="flex items-end justify-between border-t border-border-subtle pt-3">
        <span className="text-body text-foreground">最终回收金额</span>
        <PriceText value={inspection.amount} size="section" tone="price" />
      </div>
      <p className="text-caption text-muted-foreground">
        请在 30 分钟内确认，截止前将提醒 1
        次；超时未确认自动视为接受，不允许二次议价。不接受报价将安排原物退回，退回运费由平台承担。
      </p>
    </Card>
  )
}

/** 待打款：付款方披露 ＋ 打款失败原因层（?state=failed 演示） */
function PaymentCard({ order, onToast }: DetailCardProps) {
  const scene = useRecycleScene()
  const failed = scene.state === 'failed'
  const reason = (
    ['limit', 'mismatch', 'review', 'risk'].includes(scene.reason ?? '') ? scene.reason : 'limit'
  ) as 'limit' | 'mismatch' | 'review' | 'risk'
  const repayable = failed && (reason === 'limit' || reason === 'mismatch')

  return (
    <Card padding="md" className="space-y-3">
      <p className="text-body-strong text-foreground">打款信息</p>

      {failed ? (
        reason === 'risk' ? (
          <InlineNotice tone="info" title="订单审核中">
            暂未发起付款，请耐心等待；审核完成后将自动打款，详情可联系客服。
          </InlineNotice>
        ) : reason === 'review' ? (
          <InlineNotice tone="warning" title="打款异常，人工复核中">
            我们正在核实付款异常，处理完成后会尽快重新发起，无需重复操作，可联系客服咨询进度。
          </InlineNotice>
        ) : (
          <InlineNotice
            tone="danger"
            title="打款失败"
            action={
              <Button size="sm" onClick={() => onToast('已进入更换账户流程，请选择本人支付宝账户')}>
                更换账户重付
              </Button>
            }
          >
            {reason === 'limit'
              ? '收款支付宝账户超出当日收款限额，请更换本人支付宝账户后重新发起打款。'
              : '收款账户信息与实名人不一致，请更换本人支付宝账户后重新发起打款。'}
          </InlineNotice>
        )
      ) : (
        <p className="rounded-md bg-gold-50 px-3 py-2 text-caption text-gold-800 ring-1 ring-gold-200">
          款项由安盛华钟表公司通过对公账户转出，到账时间以收款银行入账为准。
        </p>
      )}

      <div className="flex items-end justify-between">
        <span className="text-body text-foreground">最终回收金额</span>
        <PriceText
          value={order.payment?.amount ?? order.inspection?.amount ?? order.estimate}
          size="title"
          tone="price"
        />
      </div>
      <KeyValueRow label="付款方" value="安盛华钟表公司" />
      <KeyValueRow label="收款账户" value={order.payment?.account ?? '平安银行 **** 9455'} />
      <KeyValueRow label="打款时效" value={order.payment?.eta ?? '确认后 2 小时内到账'} />
      {order.inspection ? (
        <KeyValueRow label="检测录像" value={<VideoDownloadLink onToast={onToast} />} />
      ) : null}
      {repayable ? (
        <p className="text-caption text-muted-foreground">
          订单保持「待打款」，更换账户后将重新发起付款；重付记录可在付款明细中查看。
        </p>
      ) : null}
    </Card>
  )
}

/** 已完成：到账凭证 */
function PaidCard({ order, onToast }: DetailCardProps) {
  return (
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
      <KeyValueRow label="付款方" value="安盛华钟表公司" />
      <KeyValueRow
        label="到账时间"
        value={<span className="tabular">{order.payment?.paidAt ?? '—'}</span>}
      />
      <KeyValueRow label="收款账户" value={order.payment?.account ?? '平安银行 **** 9455'} />
      {order.inspection ? (
        <KeyValueRow label="检测录像" value={<VideoDownloadLink onToast={onToast} />} />
      ) : null}
      <TextLink
        onClick={() => onToast('电子回单已生成，可在收款银行查看')}
        showArrow
        className="text-caption"
      >
        查看电子回单
      </TextLink>
      <TextLink onClick={() => onToast('到账凭证已开始下载')} showArrow className="text-caption">
        下载到账凭证
      </TextLink>
    </Card>
  )
}

/** 已取消 / 已关闭：关闭原因分类 ＋ 退回运单与轨迹 */
function ClosedCard({ order, onToast }: DetailCardProps) {
  const category = closeCategoryOf(order.closeReason)
  const returnItems = (order.returnEntries ?? []).map((entry, index) => ({
    key: `${entry.time}-${index}`,
    title: entry.text,
    time: entry.time,
    state: 'done' as const,
  }))

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-body-strong text-foreground">关闭说明</p>
        <Badge tone={category.tone}>{category.label}</Badge>
      </div>
      <InlineNotice tone={order.status === 'cancelled' ? 'info' : 'warning'}>
        {order.closeReason ?? '订单已关闭'}
        {order.closedAt ? <span className="tabular">（{order.closedAt}）</span> : null}
      </InlineNotice>

      {order.returnTrackingNo ? (
        <div className="space-y-3 border-t border-border-subtle pt-3">
          <p className="text-body-strong text-foreground">退回物流</p>
          <KeyValueRow label="承运方" value="顺丰速运" />
          <KeyValueRow
            label="退回运单号"
            value={<span className="tabular">{order.returnTrackingNo}</span>}
          />
          <StatusTimeline items={returnItems} />
          <p className="text-caption text-muted-foreground">
            退回运费由平台承担；签收后订单关闭，物品已按原地址寄回。
          </p>
        </div>
      ) : null}

      {order.inspection ? (
        <div className="border-t border-border-subtle pt-3">
          <KeyValueRow label="检测录像" value={<VideoDownloadLink onToast={onToast} />} />
        </div>
      ) : null}
    </Card>
  )
}

/** 状态配置里的标识 → 详情卡组件 */
const DETAIL_CARDS: Record<RecycleDetailCard, ComponentType<DetailCardProps>> = {
  testing: TestingCard,
  inspection: InspectionCard,
  payment: PaymentCard,
  paid: PaidCard,
  closed: ClosedCard,
}

/**
 * 回收订单详情（按状态）：路由末段即订单状态，用固定的演示订单渲染。
 * 待寄出 / 检测中 / 待确认 / 待打款 / 已完成 各占一条独立路由，便于评审逐状态查看。
 * 结构差异由 STATUS_VIEWS 配置声明，状态专属区块拆成独立组件组合。
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
  // 终价确认倒计时：进入页面即开始，剩余时间并入状态说明
  const [confirmDeadline] = useState(() => Date.now() + (order?.confirmRemainMin ?? 30) * 60_000)
  const confirmRemaining = useRemainingText(confirmDeadline)

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

  const view = STATUS_VIEWS[order.status]
  const DetailCard = view.card ? DETAIL_CARDS[view.card] : null

  const currentIndex = Math.max(
    RECYCLE_STAGES.findIndex((stage) => stage.key === recycleStageOf(order)),
    0,
  )

  /** 演示素材：按品类挑两张物品图 */
  const productImages =
    order.category === '金币'
      ? [images.productCoin, images.productBar1g]
      : order.category === '投资金条'
        ? [images.productBar10g, images.productBar5g]
        : [images.productBar5g, images.productBar1g]

  /** 物流轨迹按时间倒序，第一条为最新；已完结的订单不再高亮进行中 */
  const timelineItems = (order.logistics?.entries ?? []).map((entry, index) => ({
    key: `${entry.time}-${index}`,
    title: entry.text,
    time: entry.time,
    state:
      index === 0 && order.status !== 'completed' && order.status !== 'cancelled'
        ? ('current' as const)
        : ('done' as const),
  }))

  /** 确认报价：本页直接推进到待打款，方便评审看到下一状态的形态 */
  const confirmQuote = () => {
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            status: 'pending-payment',
            logistics: prev.logistics
              ? {
                  ...prev.logistics,
                  entries: [
                    { time: '刚刚', text: '终价已确认，等待打款' },
                    ...prev.logistics.entries,
                  ],
                }
              : prev.logistics,
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

  /** 操作标识 → 按钮文案、样式与行为；状态配置只引用标识 */
  const actionMap: Record<
    RecycleOrderAction,
    { label: string; variant?: 'secondary'; onClick: () => void }
  > = {
    cancel: {
      label: '取消订单',
      variant: 'secondary',
      onClick: () => setToast('已提交取消申请，客服将与您联系'),
    },
    changePickup: {
      label: '修改取件时间',
      onClick: () => setToast('取件时间已修改，快递员将按新时间上门'),
    },
    reject: {
      label: '不接受报价',
      variant: 'secondary',
      onClick: () => setRejectOpen(true),
    },
    confirm: { label: '确认报价', onClick: confirmQuote },
    contact: {
      label: '联系客服',
      variant: 'secondary',
      onClick: () => navigate(`${routePath('support.chat')}?orderId=${order.id}&kind=recycle`),
    },
    recycleAgain: { label: '再次回收', onClick: () => navigate(paths.quote) },
  }

  const footer = (
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
  )

  return (
    <DetailPage
      title="订单详情"
      footer={footer}
      stickyBar={
        // 已取消 / 已关闭的订单流程已终止，进度条不再提供有效信息
        order.status === 'cancelled' || order.status === 'closed' ? undefined : (
          <div className="px-4 py-3">
            <StatusSteps
              steps={RECYCLE_STAGES.map((stage) => ({ key: stage.key, label: stage.label }))}
              currentIndex={currentIndex}
            />
          </div>
        )
      }
    >
      <OrderStatusHeader
        status={RECYCLE_STATUS_LABEL[order.status]}
        reason={
          order.closeReason ??
          (order.status === 'pending-confirm'
            ? `检测已完成，请在 ${confirmRemaining} 内确认终价`
            : STATUS_REASON[order.status])
        }
        tone={RECYCLE_STATUS_TONE[order.status]}
      />

      {DetailCard ? <DetailCard order={order} onToast={setToast} /> : null}

      {/* 物流信息：审核通过后生成顺丰运单；审核中订单还没有运单 */}
      {order.logistics ? (
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-body-strong text-foreground">物流信息</p>
            <span className="text-caption text-subtle-foreground">{order.logistics.carrier}</span>
          </div>

          <KeyValueRow
            label="运单号"
            value={<span className="tabular">{order.logistics.trackingNo}</span>}
          />

          <StatusTimeline items={timelineItems} />
        </Card>
      ) : null}

      {/* 寄件与收件：寄件人为下单人，收件方为检测中心 */}
      <Card padding="md" className="space-y-3">
        <p className="text-body-strong text-foreground">寄件与收件</p>

        <div className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-caption text-muted-foreground ring-1 ring-border-subtle">
            寄
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-body-strong text-foreground">
              {order.sender.name}{' '}
              <span className="ml-1 text-caption tabular text-subtle-foreground">
                {order.sender.phone}
              </span>
            </p>
            <p className="mt-0.5 text-caption text-muted-foreground">{order.sender.address}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-100 text-caption text-gold-700 ring-1 ring-gold-200">
            收
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-body-strong text-foreground">{order.receiver.name}</p>
              <IconButton
                icon={Phone}
                label="联系检测中心"
                onClick={() => setToast('正在为您接入检测中心客服')}
                className="text-gold-700"
              />
            </div>
            <p className="mt-0.5 text-caption text-muted-foreground">{order.receiver.address}</p>
          </div>
        </div>

        <p className="text-caption text-subtle-foreground">
          已为您自动投保太平洋保险，取件期间请勿自行保价或投保；回收满 20 克减免运保费。
        </p>
      </Card>

      {/* 订单信息：商品信息与订单字段合并为一张卡片，成色以检测结果为准不再展示 */}
      <Card padding="md" className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-body-strong text-foreground">商品信息</p>
            <p className="mt-0.5 text-caption text-muted-foreground">共 1 件 · {order.category}</p>
          </div>
          <TextLink
            onClick={() => navigate(paths.quote)}
            showArrow
            className="shrink-0 text-caption"
          >
            估价明细
          </TextLink>
        </div>

        <div className="flex gap-2">
          {productImages.map((src, index) => (
            <div
              key={src}
              className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-2 ring-1 ring-border-subtle"
            >
              <MediaVisual
                src={src}
                alt={`物品图 ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
          <div className="flex min-w-0 flex-1 flex-col items-end justify-center text-right">
            <span className="text-body-strong text-foreground">{order.category}</span>
            <span className="mt-0.5 text-caption tabular text-muted-foreground">
              共 {order.weight}
            </span>
          </div>
        </div>

        <KeyValueRow label="黄金来源" value={order.source} />

        <div className="flex items-end justify-between border-t border-border-subtle pt-3">
          <span className="text-body text-foreground">预估回收金额</span>
          <PriceText value={order.estimate} size="section" tone="price" />
        </div>

        <div className="border-t border-border-subtle pt-3">
          <p className="mb-1 text-body-strong text-foreground">订单信息</p>
          <KeyValueRow label="订单编号" value={<span className="tabular">{order.id}</span>} />
          <KeyValueRow label="订单类型" value="邮寄回收" />
          <KeyValueRow label="回收方式" value={order.method} />
          <KeyValueRow label="实名信息" value="陈*航（已实名）" />
          <KeyValueRow label="收款方式" value="银行卡" />
          <KeyValueRow
            label="收款账号"
            value={
              <span className="tabular">{order.payment?.account ?? '平安银行 **** 9455'}</span>
            }
          />
          <KeyValueRow
            label="下单时间"
            value={<span className="tabular">{order.createdAt}</span>}
          />
          <KeyValueRow label="检测机构" value={order.center ?? DEFAULT_CENTER} />
        </div>
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
