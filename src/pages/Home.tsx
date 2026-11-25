import {
  Ban,
  ChevronRight,
  FileText,
  Landmark,
  ReceiptText,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

import { Button, Card, PlatformQualificationsCard, TabPage, RateBoard } from '@/components'
import { useDialogGuard } from '@/lib/useDialogGuard'
import { cn } from '@/lib/utils'
import { GOLD_RATE, RATE_SERIES } from '@/mocks/quote'
import { holdingsOverview } from '@/mocks/holdings'
import { readMember } from '@/mocks/member'
import { RISK_TEXT } from '@/mocks/market'
import { paths } from '@/routes/paths'

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
  { label: '加工费', desc: '不同品牌金条加工溢价', value: '5.00~8.00 元/克' },
  { label: '运费', desc: '顺丰保价 隔日达，全规格包邮', value: '免运费' },
  { label: '仓储费', desc: '平台提供免费保管', value: '免仓储费' },
  { label: '手续费', desc: '买入、提货均不收手续费', value: '免手续费' },
]

const DELIVERY_ITEMS = [
  { label: '现货直发', desc: '下单后 48 小时内顺丰保价发货，支持物流追踪' },
  { label: '到店自提', desc: '凭订单号到指定门店提取，须本人持身份证' },
  {
    label: '质检复检',
    desc: '金条附带质检证书与品牌钢印，支持第三方复检，如有不符可申请售后',
  },
]

const BUYBACK_NOTICE = {
  badge: '回购业务：暂未开放',
  summary:
    '本平台为上海黄金交易所综合类会员，仅提供实物金条买入交易，不提供回购业务。回购为金融机构业务，需另行申请资质。',
  discount: '折价标准：若未来开放回购，折价将按回收时上金所报价 - 回购损耗 2 元/克计算',
  loss: '损耗标准：回收损耗 2 元/克（含提纯、检测、物流保险费用）',
}

const PUBLICITY_TABS = [
  { key: 'compliance', label: '合规公示' },
  { key: 'fee', label: '费用标准' },
  { key: 'delivery', label: '物流发货' },
  { key: 'buyback', label: '回收须知' },
] as const

type PublicityTabKey = (typeof PUBLICITY_TABS)[number]['key']

/** 首页公示区：四张卡片合并为页签，默认展示合规公示 */
function PublicityCard() {
  const [tab, setTab] = useState<PublicityTabKey>('compliance')

  return (
    <Card padding="none" className="overflow-hidden">
      <div
        role="tablist"
        aria-label="平台公示"
        className="grid grid-cols-4 border-b border-border-subtle"
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

        {tab === 'buyback' ? (
          <div className="space-y-3">
            <span className="inline-flex rounded-sm bg-price/8 px-2 py-1 text-caption text-price ring-1 ring-price/15">
              {BUYBACK_NOTICE.badge}
            </span>
            <p className="text-caption leading-relaxed text-foreground/80">
              {BUYBACK_NOTICE.summary}
            </p>
            <div className="space-y-2 border-t border-border-subtle pt-2.5">
              <p className="text-caption leading-relaxed text-foreground/80">
                {BUYBACK_NOTICE.discount}
              </p>
              <p className="text-caption leading-relaxed text-foreground/80">
                {BUYBACK_NOTICE.loss}
              </p>
            </div>
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

      <RateBoard
        price={GOLD_RATE.price}
        source={GOLD_RATE.source}
        updatedAt={GOLD_RATE.updatedAt}
        series={RATE_SERIES}
        onRecover={() => navigate(paths.quote)}
        onBuy={() => navigate(paths.buy)}
      />

      <HoldingsSnapshotCard />

      <PublicityCard />

      <PlatformQualificationsCard />

      <RiskNoticeDialog open={riskOpen} onClose={() => setRiskOpen(false)} />
    </TabPage>
  )
}

/** 持仓速览：未登录只留空值与登录引导，登录后展示汇总并可进入资产页 */
function HoldingsSnapshotCard() {
  const navigate = useNavigate()
  const member = readMember()
  const overview = member ? holdingsOverview() : null
  const metrics = overview
    ? [
        { label: '总重量', value: `${overview.grams}g` },
        { label: '当前市值', value: `¥${overview.marketValue}` },
        {
          label: '持仓盈亏',
          value: `${overview.profit >= 0 ? '+' : '-'}${Math.abs(overview.profit)}`,
        },
      ]
    : [
        { label: '总重量', value: '--' },
        { label: '当前市值', value: '--' },
        { label: '持仓盈亏', value: '--' },
      ]

  return (
    <Card padding="md" className="space-y-3">
      <h2 className="text-card-title text-foreground">持仓速览</h2>

      <div className="grid grid-cols-3">
        {metrics.map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-caption text-subtle-foreground">{item.label}</p>
            <p className="mt-1 text-body-strong tabular text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-border-subtle pt-2.5">
        <button
          type="button"
          onClick={() => navigate(member ? paths.meHoldings : paths.login)}
          className="flex w-full items-center justify-center gap-0.5 text-caption text-gold-700"
        >
          {member ? '查看持仓详情' : '登录后查看持仓详情'}
          <ChevronRight size={14} aria-hidden="true" />
        </button>
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
