import {
  Ban,
  ChevronRight,
  ClipboardList,
  FileText,
  Landmark,
  PackageCheck,
  ReceiptText,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

import {
  Button,
  Card,
  GoldRecycleCard,
  GoldTrendCard,
  PlatformQualificationsCard,
  TabPage,
} from '@/components'
import { useDialogGuard } from '@/lib/useDialogGuard'
import { cn } from '@/lib/utils'
import { holdingsOverview } from '@/mocks/holdings'
import { readMember } from '@/mocks/member'
import { RISK_TEXT } from '@/mocks/market'
import { loginRedirectState, paths } from '@/routes/paths'

/** 顶部会员资质横幅：公示上金所综合类会员资质与 ICP 备案信息 */
const MEMBER_LICENSE = {
  label: '上海黄金交易所综合类会员',
  code: 'SHGOLD-M-2021-0312',
  filing: '沪ICP备2021XXXXXX号 · 投资金条交易服务',
}

/** 合规公示 / 费用标准 / 交割方式 / 回购标准：原文照录，仅做排版 */
const COMPLIANCE_ITEMS = [
  { icon: Landmark, text: '资金走银行合规托管通道，平台不触碰沉淀资金' },
  { icon: FileText, text: '大额交易须配合提供资金来源说明，留存备案 5 年' },
  { icon: Ban, text: '平台不承诺收益、不代客理财、不提供回购业务' },
  { icon: Users, text: '客户身份资料与交易记录留存 5 年，符合反洗钱要求' },
  { icon: ReceiptText, text: '黄金流转票据齐全，可申请增值税电子发票' },
]

const FEE_ITEMS = [
  { label: '点差', desc: '买入价高于上金所报价的差额', value: '0.70 元/克' },
  { label: '工费', desc: '工费按克重分档，克重越大单克工费越低', value: '11.00~19.00 元/克' },
  { label: '运费', desc: '顺丰保价 隔日达，全规格包邮', value: '免运费' },
  { label: '仓储费', desc: '平台提供免费保管', value: '免仓储费' },
]

const DELIVERY_ITEMS = [
  { label: '现货直发', desc: '下单后 48 小时内顺丰保价发货，支持物流追踪' },
  { label: '到店自提', desc: '凭订单号到指定门店提取，须本人持身份证' },
  {
    label: '质检复检',
    desc: '金条附带质检证书与品牌钢印，支持第三方复检，如有不符可申请售后',
  },
]

const PUBLICITY_TABS = [
  { key: 'compliance', label: '合规公示' },
  { key: 'fee', label: '费用标准' },
  { key: 'delivery', label: '物流发货' },
] as const

type PublicityTabKey = (typeof PUBLICITY_TABS)[number]['key']

/** 首页公示区：三张卡片合并为页签，默认展示合规公示 */
function PublicityCard() {
  const [tab, setTab] = useState<PublicityTabKey>('compliance')

  return (
    <Card padding="none" className="overflow-hidden">
      <div
        role="tablist"
        aria-label="平台公示"
        className="grid grid-cols-3 border-b border-border-subtle"
      >
        {PUBLICITY_TABS.map((item) => {
          const active = item.key === tab
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.key)}
              className={cn(
                'relative flex min-h-11 items-center justify-center px-0.5 text-caption transition',
                active
                  ? 'font-semibold text-gold-800 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-gold-700'
                  : 'text-muted-foreground',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="p-4">
        {tab === 'compliance' ? (
          <ul className="space-y-2.5">
            {COMPLIANCE_ITEMS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2">
                <Icon size={14} className="mt-0.5 shrink-0 text-gold-700" aria-hidden="true" />
                <span className="text-caption leading-relaxed text-foreground/80">{text}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === 'fee' ? (
          <div className="divide-y divide-border-subtle">
            {FEE_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-body-strong text-foreground">{item.label}</p>
                  <p className="mt-0.5 text-micro text-subtle-foreground">{item.desc}</p>
                </div>
                <span className="shrink-0 tabular text-body-strong text-gold-800">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {tab === 'delivery' ? (
          <div className="divide-y divide-border-subtle">
            {DELIVERY_ITEMS.map((item) => (
              <div key={item.label} className="py-2.5 first:pt-0 last:pb-0">
                <p className="text-body-strong text-foreground">{item.label}</p>
                <p className="mt-1 text-caption leading-relaxed text-foreground/80">{item.desc}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  )
}

/**
 * 首页：会员资质横幅 + 金价看板 + 平台资质 + 平台公示。
 * 金价看板的行动按钮即回收入口；浏览与估价不需要登录。
 */
export function HomePage() {
  const navigate = useNavigate()
  const [riskOpen, setRiskOpen] = useState(false)

  return (
    <TabPage>
      {/* 顶部风险声明跑马灯：标签固定，声明文字无缝横向滚动，点击查看完整提示 */}
      <div className="-mx-4 -mt-4 sticky top-0 z-20 border-b border-border-subtle bg-gold-50">
        <button
          type="button"
          onClick={() => setRiskOpen(true)}
          aria-label="查看投资风险提示"
          className="flex w-full items-center gap-2 py-2 pl-4 text-left"
        >
          <span className="shrink-0 text-caption font-semibold text-gold-900">风险声明：</span>
          <div className="marquee min-w-0 flex-1">
            <div className="marquee-track">
              {[0, 1].map((index) => (
                <span
                  key={index}
                  aria-hidden={index === 1}
                  className="whitespace-nowrap pr-10 text-caption text-gold-800"
                >
                  本平台为上海黄金交易所综合类会员，仅提供实物金条买入交易服务，黄金价格受国际市场影响存在波动风险，请充分了解后自主决策。
                </span>
              ))}
            </div>
          </div>
        </button>
      </div>

      {/* 会员资质横幅：点击进入「关于我们」查看平台资质 */}
      <button
        type="button"
        onClick={() => navigate(paths.meAbout)}
        aria-label="查看平台资质"
        className="flex w-full items-start gap-2.5 rounded-xl border border-border-subtle bg-card px-3 py-2.5 text-left transition active:bg-surface-2"
      >
        <span aria-hidden="true" className="mt-1 h-8 w-0.5 shrink-0 rounded-full bg-gold-500" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
            <span className="text-caption text-foreground">{MEMBER_LICENSE.label}</span>
            <span className="shrink-0 rounded-sm bg-gold-50 px-1 py-0.5 text-micro tabular text-gold-800 ring-1 ring-gold-200">
              {MEMBER_LICENSE.code}
            </span>
          </div>
          <p className="mt-1 text-micro text-subtle-foreground">{MEMBER_LICENSE.filing}</p>
        </div>
        <ChevronRight
          size={16}
          className="mt-2 shrink-0 text-subtle-foreground"
          aria-hidden="true"
        />
      </button>

      <GoldTrendCard />

      <BuyFlowCard />

      <HoldingsSnapshotCard />

      <GoldRecycleCard />

      <PublicityCard />

      <PlatformQualificationsCard />

      <RiskNoticeDialog open={riskOpen} onClose={() => setRiskOpen(false)} />
    </TabPage>
  )
}

/** 买金流程：首次购金从实名到签收的完整链路，降低理解成本 */
const BUY_FLOW_STEPS = [
  { icon: ShieldCheck, label: '实名认证' },
  { icon: ShoppingBag, label: '选购商品' },
  { icon: ClipboardList, label: '下单支付' },
  { icon: Truck, label: '物流配送' },
  { icon: PackageCheck, label: '签收完成' },
]

/** 买金流程指南：置于「我的购金」上方，横向五步展示 */
function BuyFlowCard() {
  return (
    <Card padding="md" className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <h2 className="text-card-title text-foreground">买金流程</h2>
        <span className="text-caption text-subtle-foreground">
          完成实名认证后选购金条，顺丰寄送到家
        </span>
      </div>
      <ol className="relative flex items-start">
        <span
          aria-hidden="true"
          className="absolute left-[10%] right-[10%] top-4 h-px bg-border-subtle"
        />
        {BUY_FLOW_STEPS.map((step) => {
          const Icon = step.icon
          return (
            <li
              key={step.label}
              className="relative flex flex-1 flex-col items-center gap-1.5 text-center"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-50 text-gold-700 ring-1 ring-gold-200">
                <Icon size={16} aria-hidden="true" />
              </span>
              <span className="text-micro text-foreground/85">{step.label}</span>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}

/** 我的购金：未登录只留空值与登录引导，登录后展示账面汇总并可进入资产页 */
function HoldingsSnapshotCard() {
  const navigate = useNavigate()
  const member = readMember()
  const overview = member ? holdingsOverview() : null
  const metrics = overview
    ? [
        { label: '总克重', value: `${overview.grams}克`, tone: 'text-foreground' },
        { label: '购入总价(元)', value: overview.cost.toFixed(2), tone: 'text-foreground' },
        { label: '预估总价(元)', value: overview.marketValue.toFixed(2), tone: 'text-success' },
        {
          label: '预估收益(元)',
          value: `${overview.profit >= 0 ? '+' : '-'}${Math.abs(overview.profit).toFixed(2)}`,
          tone: 'text-price',
        },
      ]
    : [
        { label: '总克重', value: '--', tone: 'text-foreground' },
        { label: '购入总价(元)', value: '--', tone: 'text-foreground' },
        { label: '预估总价(元)', value: '--', tone: 'text-foreground' },
        { label: '预估收益(元)', value: '--', tone: 'text-foreground' },
      ]

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-card-title text-foreground">我的购金</h2>
        <button
          type="button"
          onClick={() =>
            member
              ? navigate(paths.meHoldings)
              : navigate(paths.login, { state: loginRedirectState() })
          }
          className="flex shrink-0 items-center gap-0.5 text-caption text-gold-700"
        >
          {member ? '我的资产' : '登录后查看我的资产'}
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {metrics.map((item) => (
          <div key={item.label} className="min-w-0 text-center">
            <p className="whitespace-nowrap text-micro text-subtle-foreground">{item.label}</p>
            <p className={`mt-1 text-body-strong tabular ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

/** 点击顶部跑马灯后的完整风险提示：只做阅读告知，无需勾选 */
function RiskNoticeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  useDialogGuard({ open, onClose, panelRef, historyKey: '__home-risk' })

  if (!open) return null

  const content = (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="投资风险提示"
        tabIndex={-1}
        className="relative w-full max-w-80 rounded-lg bg-card p-4 shadow-lg outline-none"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="shrink-0 text-gold-700" aria-hidden="true" />
          <h2 className="text-card-title text-foreground">投资风险提示</h2>
        </div>
        <p className="mt-2 text-body leading-relaxed text-muted-foreground">{RISK_TEXT}</p>
        <Button block className="mt-4" onClick={onClose}>
          我已知晓
        </Button>
      </div>
    </div>
  )

  const host = document.querySelector<HTMLElement>('[data-phone-frame]')
  return host ? createPortal(content, host) : content
}
