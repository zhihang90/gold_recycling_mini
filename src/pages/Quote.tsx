import {
  AgreementCheck,
  AddressPickerSheet,
  Badge,
  BankAccountPickerSheet,
  BottomSheet,
  Button,
  Card,
  DetailPage,
  EmptyState,
  InlineNotice,
  ListItem,
  MediaVisual,
  PhotoUploader,
  PickupTimeSheet,
  PriceText,
  RuleSheet,
  SummaryActionBar,
  TextLink,
  Toast,
  formatPickupTime,
  type PickupTimeSlot,
} from '@/components'
import { Fragment, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRightLeft,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Clock,
  ClipboardList,
  HelpCircle,
  Image as ImageIcon,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
  Wallet,
  CircleDollarSign,
  Camera,
} from 'lucide-react'

import { validateWeight } from '@/lib/validation'
import {
  GOLD_RATE,
  OVER_FREE_GRAM,
  QUOTE_CATEGORIES,
  RATE_SERIES,
  calculateQuote,
  clearQuoteDraft,
  readQuoteDraft,
  readQuoteDraftPhotos,
  saveQuoteSnapshot,
  writeQuoteDraft,
  writeQuoteDraftPhotos,
} from '@/mocks/quote'
import type { QuoteBreakdown } from '@/mocks/quote'
import { SHIPPING_RULES } from '@/mocks/shipping'
import { clearAgreementConfirmation, readAgreementConfirmation } from '@/mocks/agreement'
import { paths } from '@/routes/paths'
import { useSheetScene } from '@/lib/useDemoScene'
import { useReviewState } from '@/lib/useReviewState'
import { images } from '@/assets/images'
import { maskPhone, readAddresses, selectAddress, type ShippingAddress } from '@/mocks/addressBook'
import { readBankAccounts, tailNo, type BankAccount } from '@/mocks/bankAccounts'

/** 金价走势折线：纯 SVG，3 周期切 Tab */
function RateChart({
  points,
  height = 140,
}: {
  points: { label: string; price: number }[]
  height?: number
}) {
  if (points.length < 2) return null
  const prices = points.map((p) => p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const pad = 0.12
  const yMin = min - range * pad
  const yMax = max + range * pad
  const w = 335
  const h = height
  const stepX = w / (points.length - 1)

  const coords = points.map((p, i) => {
    const x = i * stepX
    const y = h - ((p.price - yMin) / (yMax - yMin)) * h
    return { x, y }
  })
  const linePath = coords.map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`)).join(' ')
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${h} L ${coords[0].x} ${h} Z`
  const last = coords[coords.length - 1]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} className="block">
      <defs>
        <linearGradient id="rate-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-gold-300)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--color-gold-300)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* 水平 3 条辅助线 */}
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1="0"
          x2={w}
          y1={h * p}
          y2={h * p}
          stroke="var(--color-border-subtle)"
          strokeDasharray="2 3"
          strokeWidth="1"
        />
      ))}
      <path d={areaPath} fill="url(#rate-area)" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--color-gold-500)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* 末点高亮 */}
      <circle cx={last.x} cy={last.y} r="4" fill="var(--color-gold-500)" />
      <circle cx={last.x} cy={last.y} r="7" fill="var(--color-gold-500)" fillOpacity="0.2" />
    </svg>
  )
}

/** 明细 Sheet 里的单项：label + 右侧金额 + 可选公式行 */
function BreakdownLine({
  label,
  amount,
  formula,
  tone = 'ink',
}: {
  label: string
  amount: number
  formula?: string
  tone?: 'ink' | 'price'
}) {
  const negate = amount < 0
  const display = Math.abs(amount)
  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-body text-foreground">{label}</span>
        </div>
        <div className="shrink-0 text-right tabular">
          <PriceText
            value={display}
            prefix={negate ? '-' : ''}
            tone={tone === 'price' ? 'price' : 'ink'}
            size="body"
            decimals={2}
          />
        </div>
      </div>
      {formula ? <p className="mt-1 text-caption text-subtle-foreground">{formula}</p> : null}
    </div>
  )
}

/** 主 Sheet：预估回收价明细 */
function QuoteDetailSheet({
  open,
  onClose,
  breakdown,
}: {
  open: boolean
  onClose: () => void
  breakdown: QuoteBreakdown | null
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="预估回收价明细"
      subtitle="数据根据实时行情动态更新"
      footer={
        breakdown ? (
          <div className="flex items-center justify-between">
            <span className="text-label text-muted-foreground">预估回收价</span>
            <PriceText
              value={breakdown.payable}
              tone="price"
              size="display"
              decimals={2}
              className="tabular"
            />
          </div>
        ) : undefined
      }
    >
      <div className="space-y-3">
        <InlineNotice tone="info">
          预估回收金额是基于您下单时的金价、预估克重、运费、保险费、加价券等综合计算的参考价格，不代表最终成交金额。
        </InlineNotice>

        {breakdown ? (
          <>
            {/* 总价值 + 服务费 合并 Card */}
            <Card padding="none" className="overflow-hidden">
              <div className="px-4 divide-y divide-border-subtle">
                <BreakdownLine
                  label="预估金条总价值"
                  amount={breakdown.estimatedValue}
                  formula={`金条克重 × 实时金价 = ${breakdown.totalGram.toFixed(2)} × ${breakdown.price.toFixed(2)}`}
                  tone="price"
                />
                <BreakdownLine
                  label="预估服务费"
                  amount={-breakdown.serviceFee}
                  formula={`预估总价值 × 服务费率 ${(breakdown.serviceFeeRate * 100).toFixed(0)}% = ${breakdown.estimatedValue.toFixed(2)} × ${(breakdown.serviceFeeRate * 100).toFixed(0)}%`}
                />
              </div>
            </Card>

            {/* 运费 + 保险费 Card */}
            <Card padding="none" className="overflow-hidden">
              {breakdown.over20Free ? (
                <div className="px-4 divide-y divide-border-subtle">
                  <div className="flex items-start justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Truck size={16} className="shrink-0 text-subtle-foreground" />
                      <span className="truncate text-body text-foreground">
                        运费（满{OVER_FREE_GRAM}克减免）
                      </span>
                      <Badge tone="success">已减免</Badge>
                    </div>
                    <div className="shrink-0 text-right tabular">
                      <PriceText value={0} decimals={2} />
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <ShieldCheck size={16} className="shrink-0 text-subtle-foreground" />
                      <span className="truncate text-body text-foreground">
                        保险费（满{OVER_FREE_GRAM}克减免）
                      </span>
                      <Badge tone="success">已减免</Badge>
                    </div>
                    <div className="shrink-0 text-right tabular">
                      <PriceText value={0} decimals={2} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 divide-y divide-border-subtle">
                  <div className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="shrink-0 text-subtle-foreground" />
                        <p className="text-body text-foreground">运费（不满{OVER_FREE_GRAM}克）</p>
                      </div>
                      <p className="mt-1 text-caption text-subtle-foreground pl-7">
                        广东省内 18 元 / 省外 23 元
                      </p>
                    </div>
                    <div className="shrink-0 text-right tabular">
                      <PriceText value={-breakdown.shippingFee} decimals={2} />
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="shrink-0 text-subtle-foreground" />
                        <p className="text-body text-foreground">
                          保险费（不满{OVER_FREE_GRAM}克）
                        </p>
                      </div>
                      <p className="mt-1 text-caption text-subtle-foreground pl-7">
                        预估总价值 × 0.1%
                      </p>
                    </div>
                    <div className="shrink-0 text-right tabular">
                      <PriceText value={-breakdown.insuranceFee} decimals={2} />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="请填写克重"
            description="输入克重后即可查看预估回收价明细"
          />
        )}
      </div>
    </BottomSheet>
  )
}

/** 上传实物照片及凭证：至少两张，确认后回填到物品信息行 */
function PhotoProofSheet({
  open,
  onClose,
  photos,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  photos: string[]
  onConfirm: (photos: string[]) => void
}) {
  const [draft, setDraft] = useState<string[]>(photos)
  const [error, setError] = useState<string | null>(null)

  // 每次打开以已提交的照片为起点，未确认的改动不保留
  useEffect(() => {
    if (open) {
      setDraft(photos)
      setError(null)
    }
  }, [open, photos])

  const examples = [
    images.sampleBar,
    images.sampleBracelet,
    images.sampleRing,
    images.invoiceSample,
  ]

  const handleConfirm = () => {
    if (draft.length < 2) {
      setError('请至少上传两张照片')
      return
    }
    onConfirm(draft)
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="上传实物照片及凭证"
      footer={
        <Button size="lg" block onClick={handleConfirm}>
          确认提交
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-body text-foreground">
          1、请上传清晰完整的黄金实物照片及凭证(发票、凭证)
          <span className="text-caption text-gold-700">（至少上传两张）</span>
        </p>

        <PhotoUploader
          value={draft}
          onChange={(next) => {
            setDraft(next)
            if (next.length >= 2) setError(null)
          }}
          max={6}
          addLabel="上传照片"
          addIcon={Camera}
          hint="至少上传 2 张"
        />
        {error ? <p className="text-caption text-destructive">{error}</p> : null}

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border-subtle" />
          <span className="text-caption text-muted-foreground">查看示例</span>
          <span className="h-px flex-1 bg-border-subtle" />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {examples.map((src) => (
            <div key={src} className="overflow-hidden rounded-sm ring-1 ring-border-subtle">
              <MediaVisual src={src} alt="示例照片" />
            </div>
          ))}
        </div>
      </div>
    </BottomSheet>
  )
}

/** ===== 主页面 ===== */
export function QuotePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  /** 带参进入（首页透传品类/克重）视为一次新的估价，不读草稿 */
  const [draft] = useState(() => {
    const hasEntryParams = Boolean(searchParams.get('category') || searchParams.get('weight'))
    return hasEntryParams ? null : readQuoteDraft()
  })
  const draftCategory = QUOTE_CATEGORIES.some((item) => item.value === draft?.category)
    ? (draft?.category as string)
    : null
  const initialCategory =
    draftCategory ?? (searchParams.get('category') === 'jewelry' ? 'jewelry' : 'bar')
  /** 弹层状态直达：?sheet=&state= 用于演示与状态枚举，不影响正常交互 */
  const sheetScene = useSheetScene()
  const review = useReviewState('quote')
  const inputMode = review.values.input ?? 'auto'
  const docsMode = review.values.docs ?? 'auto'
  const agreedMode = review.values.agreed ?? 'auto'
  /** 评审覆盖时不写草稿，避免把演示值固化进真实表单 */
  const reviewActive = inputMode !== 'auto' || docsMode !== 'auto' || agreedMode !== 'auto'

  const [category, setCategory] = useState(initialCategory)
  const [purity, setPurity] = useState(() => {
    const option = QUOTE_CATEGORIES.find((c) => c.value === initialCategory)
    const fallback = option?.purities[0] ?? '999.9'
    return draft?.purity && option?.purities.includes(draft.purity) ? draft.purity : fallback
  })
  const [weight, setWeight] = useState(() => {
    if (inputMode === 'empty') return ''
    if (inputMode === 'filled') return '20'
    return draft?.weight ?? searchParams.get('weight') ?? ''
  })
  /** 重量输入框聚焦态：未聚焦且无内容时使用折叠样式 */
  const [weightFocused, setWeightFocused] = useState(false)
  const [showDetailSheet, setShowDetailSheet] = useState(sheetScene.is('detail'))
  const [showFreightSheet, setShowFreightSheet] = useState(sheetScene.is('freight'))
  /** 提交前的缺失项提示 */
  const [toast, setToast] = useState<string | null>(null)
  /** 提交中：按钮转圈并禁用，防止重复预约 */
  const [submitting, setSubmitting] = useState(false)
  /** 寄件地址默认不选中，由用户点击地址栏从地址簿选择；有草稿时按 id 回查 */
  const [address, setAddress] = useState<ShippingAddress | null>(() => {
    if (docsMode === 'none') return null
    if (docsMode === 'ready') return readAddresses()[0] ?? null
    return draft?.addressId
      ? (readAddresses().find((item) => item.id === draft.addressId) ?? null)
      : null
  })
  const [addressSheet, setAddressSheet] = useState(sheetScene.is('address'))
  /** 上门取件时间默认不选中，点击时间行后从弹层选择 */
  const [pickupTime, setPickupTime] = useState<PickupTimeSlot | null>(draft?.pickupTime ?? null)
  const [pickupSheet, setPickupSheet] = useState(sheetScene.is('pickup'))
  /** 实物照片与凭证：默认空，弹层确认后回填 */
  const [photos, setPhotos] = useState<string[]>(() => (draft ? readQuoteDraftPhotos() : []))
  const [photoSheet, setPhotoSheet] = useState(sheetScene.is('photo'))
  /** 收款方式：默认不选中，弹层确认后回填；有草稿时按 id 回查 */
  const [payAccount, setPayAccount] = useState<BankAccount | null>(() => {
    if (docsMode === 'none') return null
    if (docsMode === 'ready') return readBankAccounts()[0] ?? null
    return draft?.payAccountId
      ? (readBankAccounts().find((item) => item.id === draft.payAccountId) ?? null)
      : null
  })
  const [paySheet, setPaySheet] = useState(sheetScene.is('bank'))
  const [chartPeriod, setChartPeriod] = useState<string>(RATE_SERIES[0]?.key ?? 'today')
  const [swapMode, setSwapMode] = useState<'weight' | 'price'>('weight')

  /**
   * 是否已勾选两份协议：只在协议阅读页确认后回填。
   * 确认凭据是「一次性」的——页面挂载后立即消费，保证每次新预约都不会被默认勾选。
   */
  const [agreed, setAgreed] = useState(() => {
    if (agreedMode === 'yes') return true
    if (agreedMode === 'no') return false
    return Boolean(readAgreementConfirmation()) || draft?.agreed === true
  })

  useEffect(() => {
    clearAgreementConfirmation()
  }, [])

  // 表单草稿：去阅读协议 / 选地址 / 绑收款账户后返回，页面重挂载时原样恢复
  useEffect(() => {
    if (reviewActive) return
    writeQuoteDraft({
      category,
      purity,
      weight,
      addressId: address?.id ?? null,
      pickupTime,
      payAccountId: payAccount?.id ?? null,
      agreed,
    })
  }, [reviewActive, category, purity, weight, address?.id, pickupTime, payAccount?.id, agreed])

  // 照片单独一个 key：base64 体积大，写失败也不影响上面的字段
  useEffect(() => {
    writeQuoteDraftPhotos(photos)
  }, [photos])

  const quote = calculateQuote({
    category,
    weight,
    purity,
    quantity: 1,
  })
  const weightError = validateWeight(weight)
  const categoryLabel = QUOTE_CATEGORIES.find((c) => c.value === category)?.label ?? '金条'
  /** 有输入或处于聚焦时展开为双列估价样式，否则用折叠样式 */
  const weightExpanded = weightFocused || weight.trim() !== ''

  const chartSeries = RATE_SERIES.find((s) => s.key === chartPeriod) ?? RATE_SERIES[0]

  /** 当用户输入的纯度在切换品类后不再合法时，重置为该品类第一个可选值 */
  const onCategoryChange = (v: string) => {
    const next = QUOTE_CATEGORIES.find((c) => c.value === v)
    if (!next?.supported) return
    setCategory(v)
    if (!next.purities.includes(purity)) {
      setPurity(next.purities[0])
    }
  }

  /** ⇄ 交换：当前是"输入重量"时切为"输入金额"（反推重量），反之切回"输入重量" */
  const toggleSwap = () => {
    if (!quote) return
    if (swapMode === 'weight') {
      // 以预估回收价反推重量：payable = price * purity * gram * quantity - fee ... 简化：反推到克重 ≈ (payable + fee) / (price * purity)
      const feeTotal = quote.serviceFee + quote.shippingFee + quote.insuranceFee
      const impliedGram = (quote.payable + feeTotal) / (quote.price * quote.purityFactor)
      setWeight(impliedGram.toFixed(2))
      setSwapMode('price')
    } else {
      setSwapMode('weight')
    }
  }

  /** 提交：按钮常亮，按表单顺序提示第一个未填项 */
  const onCalculate = () => {
    if (weightError) {
      setToast(weightError)
      return
    }
    if (!quote) return
    if (!address) {
      setToast('请选择寄件地址')
      return
    }
    if (!pickupTime) {
      setToast('请选择上门取件时间')
      return
    }
    if (photos.length < 2) {
      setToast('请至少上传两张实物照片')
      return
    }
    if (!payAccount) {
      setToast('请选择收款方式')
      return
    }
    if (!agreed) {
      setToast('请先阅读并勾选两份协议')
      return
    }
    saveQuoteSnapshot({ category, weight, purity, quantity: 1 }, quote)
    // 预约已提交：清空草稿，下次从首页进入是干净的空白表单
    clearQuoteDraft()
    setSubmitting(true)
    window.setTimeout(() => navigate(paths.submitResult, { replace: true }), 700)
  }

  /** 协议勾选：未勾选时点击进入阅读确认页，已勾选时点击直接取消 */
  const onAgreementChange = (next: boolean) => {
    if (next) {
      navigate(paths.quoteAgreement)
      return
    }
    clearAgreementConfirmation()
    setAgreed(false)
  }

  return (
    <>
      <DetailPage
        title="回收预约"
        padded={false}
        footer={
          <>
            {/* 协议勾选：随吸底栏常驻 */}
            <AgreementCheck checked={agreed} onChange={onAgreementChange} align="center">
              <span className="text-caption text-muted-foreground">
                我已阅读并同意
                <TextLink
                  onClick={() => navigate(paths.quoteAgreement)}
                  inline
                  className="text-caption text-link"
                >
                  《贵金属回收须知》
                </TextLink>
                <TextLink
                  onClick={() => navigate(paths.quoteAgreement)}
                  inline
                  className="text-caption text-link"
                >
                  《黄金合法来源协议》
                </TextLink>
              </span>
            </AgreementCheck>

            {/* 金额摘要 + 主行动：沿用组件库样式 */}
            <SummaryActionBar
              label="预估回收价"
              amount={quote ? quote.payable : null}
              amountSize="title"
              onExplain={quote ? () => setShowDetailSheet(true) : undefined}
              explainLabel="查看预估回收价明细"
              actionLabel="立即预约"
              onAction={onCalculate}
              actionLoading={submitting}
              actionSize="lg"
            />
          </>
        }
      >
        {/* Banner 区：浅金渐变 + 品牌标语 + 金条装饰 */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gold-50 via-gold-100/60 to-gold-50 px-4 pb-4 pt-5">
          <div className="relative flex gap-3">
            <div className="min-w-0 flex-1 text-gold-800/90">
              <p className="font-serif text-title leading-tight">黄金回收</p>
              <p className="font-serif text-title leading-tight">找安盛华 没烦恼</p>
              <p className="mt-1 text-caption text-gold-700">交易所会员 · 专业正规</p>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none relative h-24 w-24 shrink-0 overflow-hidden rounded-md ring-1 ring-gold-200"
            >
              <MediaVisual
                src={images.heroBrand}
                alt=""
                className="absolute inset-0 h-full w-full object-cover [mask-image:linear-gradient(to_left,black_60%,transparent)]"
              />
            </div>
          </div>
          {/* 装饰性金色光斑 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-6 h-36 w-36 rounded-full bg-gold-300/40 blur-2xl"
          />
        </section>

        <div className="space-y-3 px-4 pt-3 pb-6">
          {/* 估价卡：品类 Tab + 重量/金额 + 费用明细，同一张卡内用分隔线分区 */}
          <Card padding="none" className="overflow-hidden">
            <div className="flex border-b border-border-subtle">
              {QUOTE_CATEGORIES.map((cat) => {
                const active = cat.value === category
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => onCategoryChange(cat.value)}
                    className={
                      'relative flex-1 py-3 text-center transition ' +
                      (active ? 'text-gold-700 font-medium' : 'text-muted-foreground')
                    }
                  >
                    <span className="text-label-strong">{cat.label}</span>
                    {active ? (
                      <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-gold-500" />
                    ) : null}
                  </button>
                )
              })}
            </div>
            {/* 重量输入：未聚焦且无内容为单列折叠样式，聚焦或有值时展开为双列估价样式 */}
            <div className="px-4 pb-3 pt-3">
              {weightExpanded ? (
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <span className="text-caption text-subtle-foreground">重量（克）</span>
                  <span className="w-9" aria-hidden="true" />
                  <span className="flex items-center gap-1 text-caption text-subtle-foreground">
                    预估金额（元）
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowDetailSheet(true)}
                      aria-label="查看预估回收价明细"
                      className="flex items-center"
                    >
                      <HelpCircle size={14} className="text-subtle-foreground" aria-hidden="true" />
                    </button>
                  </span>
                </div>
              ) : (
                <p className="text-center text-caption text-subtle-foreground">
                  {categoryLabel}克重（克）
                </p>
              )}

              <div
                className={
                  weightExpanded
                    ? 'mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-md bg-surface-2/60 px-3 py-2'
                    : 'mt-2'
                }
              >
                <input
                  value={weight}
                  inputMode="decimal"
                  aria-label={weightExpanded ? '重量（克）' : `${categoryLabel}克重（克）`}
                  onFocus={() => setWeightFocused(true)}
                  onBlur={() => setWeightFocused(false)}
                  onChange={(e) => setWeight(e.target.value)}
                  className={
                    weightExpanded
                      ? 'min-w-0 w-full bg-transparent font-inherit text-section text-foreground tabular outline-none placeholder:text-muted-foreground'
                      : 'w-full rounded-md bg-surface-2/60 px-4 py-3 text-center font-inherit text-section text-foreground tabular outline-none placeholder:text-muted-foreground'
                  }
                  placeholder="请输入克重"
                />

                {weightExpanded ? (
                  <>
                    {/* 中间交换按钮 */}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={toggleSwap}
                      aria-label="在重量与金额之间切换计算方向"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-border-subtle active:bg-muted"
                    >
                      <ArrowRightLeft size={15} strokeWidth={1.8} />
                    </button>

                    {/* 右侧：预估金额；未填克重时显示问号，点击查看明细空态 */}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowDetailSheet(true)}
                      aria-label={quote ? '查看预估回收价明细' : '查看预估明细（请先填写克重）'}
                      className="min-w-0 text-right text-section tabular"
                    >
                      <span className="text-price">{quote ? quote.payable.toFixed(2) : '?'}</span>
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {/* 预估明细：实时金价常驻，展开态再显示服务费与运保费 */}
            <div className="border-t border-border-subtle divide-y divide-border-subtle">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <CircleDollarSign size={16} className="text-subtle-foreground" />
                  <span className="text-body text-muted-foreground">实时金价</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-body-strong tabular text-price">
                    {(quote?.price ?? GOLD_RATE.price).toFixed(2)}
                  </span>
                  <span className="text-caption text-subtle-foreground">元/克</span>
                </div>
              </div>

              {weightExpanded ? (
                <>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-subtle-foreground" />
                      <span className="text-body text-muted-foreground">服务费</span>
                      <span className="text-caption text-subtle-foreground">
                        {`按金价 ${((QUOTE_CATEGORIES.find((c) => c.value === category)?.serviceFeeRate ?? 0) * 100).toFixed(0)}%`}
                      </span>
                    </div>
                    {quote ? (
                      <div className="flex items-baseline gap-1.5 text-right tabular">
                        <span className="text-body-strong text-price">
                          {quote.serviceFeePerGram.toFixed(2)}
                        </span>
                        <span className="text-caption text-subtle-foreground">元/克</span>
                      </div>
                    ) : (
                      <span className="text-body text-muted-foreground tabular">—</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-subtle-foreground" />
                      <span className="text-body text-muted-foreground">运保费</span>
                      {quote?.over20Free ? (
                        <Badge tone="success">满{OVER_FREE_GRAM}克减免</Badge>
                      ) : null}
                    </div>
                    {quote ? (
                      <span className="text-body tabular text-foreground">
                        ¥{(quote.shippingFee + quote.insuranceFee).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-body text-muted-foreground tabular">—</span>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* 保险提示：仅展开态展示，保持折叠态简洁 */}
            {weightExpanded ? (
              <div className="border-t border-border-subtle bg-gold-50/60 px-4 py-3 text-caption text-gold-800">
                已为您自动投保太平洋保险，顺丰上门取件期间请勿使用“保价、投保”等功能。回收满
                {OVER_FREE_GRAM}克减免运保费。
                <TextLink
                  className="ml-1 text-caption-strong"
                  onClick={() => setShowFreightSheet(true)}
                >
                  查看详情
                </TextLink>
              </div>
            ) : null}
          </Card>

          {/* 走势图 */}
          <Card padding="md" className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-caption text-subtle-foreground">参考 {GOLD_RATE.source} 收盘价</p>
            </div>
            <RateChart points={chartSeries.points} />
            <div className="flex justify-center gap-2 pt-1">
              {RATE_SERIES.map((s) => {
                const active = s.key === chartPeriod
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setChartPeriod(s.key)}
                    className={
                      'rounded-full px-3 py-1 text-caption transition ' +
                      (active
                        ? 'bg-gold-100 text-gold-700 ring-1 ring-gold-300'
                        : 'text-muted-foreground bg-surface-2')
                    }
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </Card>

          {/* 下单信息：流程 + 地址 / 寄件 / 检测 / 时间 / 物品 / 收款，收进同一张卡片 */}
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center px-3 py-4">
              {[
                { label: '线上下单', icon: CircleDollarSign },
                { label: '顺丰邮寄', icon: Truck },
                { label: '检测鉴定', icon: CheckCircle2 },
                { label: '打款完成', icon: Banknote },
              ].map((step, i, arr) => {
                const Icon = step.icon
                return (
                  <Fragment key={step.label}>
                    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-50 text-gold-700 ring-1 ring-gold-200">
                        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <span className="truncate text-caption text-muted-foreground">
                        {step.label}
                      </span>
                    </div>
                    {i < arr.length - 1 ? (
                      <ChevronRight
                        size={14}
                        className="shrink-0 text-ink-300"
                        aria-hidden="true"
                      />
                    ) : null}
                  </Fragment>
                )
              })}
            </div>

            <div className="border-t border-border-subtle">
              <ListItem
                icon={MapPin}
                title={address ? `${address.name} ${maskPhone(address.phone)}` : '请选择寄件地址'}
                description={
                  address
                    ? `${address.region} ${address.place}${address.doorNo}`
                    : '点击从地址簿选择顺丰上门取件地址'
                }
                showArrow
                divider
                onClick={() => setAddressSheet(true)}
              />
              <ListItem
                icon={Truck}
                title="已为您匹配最优寄件方式"
                right={
                  <span className="flex items-center gap-1 rounded-md bg-gold-50 px-2 py-0.5 text-caption text-gold-700 ring-1 ring-gold-200">
                    <span className="font-semibold">SF</span> 顺丰邮寄
                  </span>
                }
                divider
              />
              <ListItem
                icon={Package}
                title="送至 安盛华集团检测中心"
                description="广东省深圳市盐田区市保税区沙头角太平洋工业区3栋6楼"
                divider
              />
              <ListItem
                icon={Clock}
                title={pickupTime ? formatPickupTime(pickupTime) : '请选择上门取件时间'}
                showArrow
                divider
                onClick={() => setPickupSheet(true)}
              />

              {/* 物品信息：未上传时提示上传，已上传后行内展示缩略图 */}
              <ListItem
                icon={ImageIcon}
                title={
                  photos.length > 0 ? (
                    <span className="flex items-center gap-2">
                      {photos.slice(0, 3).map((src, index) => (
                        <span
                          key={`${src.slice(-12)}-${index}`}
                          className="block h-10 w-10 overflow-hidden rounded-sm ring-1 ring-border-subtle"
                        >
                          <MediaVisual src={src} alt={`物品照片 ${index + 1}`} />
                        </span>
                      ))}
                    </span>
                  ) : (
                    '请上传黄金实物照片和凭证'
                  )
                }
                showArrow
                divider
                onClick={() => setPhotoSheet(true)}
              />

              <ListItem
                icon={Wallet}
                title={
                  payAccount
                    ? `${payAccount.bank} **** ${tailNo(payAccount.cardNo)}`
                    : '请选择收款方式'
                }
                showArrow
                onClick={() => setPaySheet(true)}
              />
            </div>
          </Card>

          {/* 温馨提示黄卡 */}
          <Card padding="sm" className="bg-gold-50/60 ring-gold-200">
            <p className="mb-2 text-caption-strong text-gold-800">温馨提示</p>
            <ul className="space-y-1 text-caption text-gold-800/80">
              <li>① 预估回收金额是参考您下单时金价计算，最终按检测完成时点的实时金价结算。</li>
              <li>② 所有黄金物品的包装盒及非黄金配件无需寄出，仓库无法代为保管或退回。</li>
              <li>③ 检测完成后，证书等附件将统一处理，恕不保留或退回。</li>
              <li>④ 塑封金钞按金饰费率回收，克重按标记克重的 90% 折算。</li>
            </ul>
          </Card>

          {/* 协议勾选已随吸底栏常驻，页面内不再重复 */}
        </div>
      </DetailPage>

      {/* 预估回收价明细 */}
      <QuoteDetailSheet
        open={showDetailSheet}
        onClose={() => setShowDetailSheet(false)}
        breakdown={quote}
      />

      {/* 运保费规则 */}
      <RuleSheet
        open={showFreightSheet}
        onClose={() => setShowFreightSheet(false)}
        title="运保费规则"
        sections={SHIPPING_RULES}
      />

      {/* 上门取件时间：日期 + 时段 */}
      <PickupTimeSheet
        open={pickupSheet}
        onClose={() => setPickupSheet(false)}
        value={pickupTime}
        onSelect={(next) => {
          setPickupTime(next)
          setPickupSheet(false)
        }}
      />

      {/* 实物照片与凭证 */}
      <PhotoProofSheet
        open={photoSheet}
        onClose={() => setPhotoSheet(false)}
        photos={photos}
        onConfirm={(next) => {
          setPhotos(next)
          setPhotoSheet(false)
        }}
      />

      {/* 收款方式：复用收款账户列表 */}
      <BankAccountPickerSheet
        open={paySheet}
        onClose={() => setPaySheet(false)}
        accounts={sheetScene.is('bank') && sheetScene.state === 'empty' ? [] : readBankAccounts()}
        selectedId={payAccount?.id ?? null}
        onConfirm={(account) => {
          setPayAccount(account)
          setPaySheet(false)
        }}
        onBind={() => {
          setPaySheet(false)
          navigate(paths.meAccountForm)
        }}
      />

      {/* 寄件地址选择：复用买金提交订单的地址抽屉 */}
      <AddressPickerSheet
        open={addressSheet}
        onClose={() => setAddressSheet(false)}
        addresses={sheetScene.is('address') && sheetScene.state === 'empty' ? [] : readAddresses()}
        selectedId={address?.id ?? null}
        title="选择寄件地址"
        onSelect={(item) => {
          selectAddress(item.id)
          setAddress(item)
          setAddressSheet(false)
        }}
        onAdd={() => navigate(paths.ship.addressForm)}
      />

      <Toast open={!!toast} message={toast ?? ''} onClose={() => setToast(null)} />
    </>
  )
}
