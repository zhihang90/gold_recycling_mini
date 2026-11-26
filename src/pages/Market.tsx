import {
  AgreementCheck,
  Badge,
  BottomSheet,
  Button,
  Card,
  Chip,
  ConfirmDialog,
  FormField,
  IconButton,
  InlineNotice,
  PriceSubscribeSheet,
  TabPage,
  TextLink,
  Toast,
} from '@/components'
import { cn } from '@/lib/utils'
import { formatDateTime, round2 } from '@/lib/money'
import { useDialogGuard } from '@/lib/useDialogGuard'
import { useReviewState } from '@/lib/useReviewState'
import {
  ALERT_DIRECTION_LABEL,
  ALERT_LIMIT,
  BAR_PRICE_TIERS,
  DEFAULT_TRADE_GRAMS,
  FX_RATES,
  MARKET_QUOTES,
  NEWS_DISCLAIMER,
  QUOTE_GLOSSARY,
  RELATED_PRODUCTS,
  RETAIL_GOLD,
  RISK_TEXT,
  TREND_RANGES,
  WATCH_LIMIT,
  addAlert,
  buildTrendSeries,
  clearWatchlist,
  defaultTargetPrice,
  getLivePrice,
  quoteByCode,
  quoteChange,
  quoteName,
  readRiskAck,
  readPriceSubscription,
  readWatchlist,
  removeAlert,
  removeWatch,
  sortedNews,
  writeRiskAck,
  type ChartPoint,
  type PriceAlert,
  type Quote,
  type TrendRange,
} from '@/mocks/market'
import { feePerGram, salePriceOf, subscribeGoldPrice } from '@/mocks/pricing'
import { productForGrams } from '@/mocks/goldShop'
import { isMemberVerified, readMember } from '@/mocks/member'
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Info,
  Newspaper,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { buyDetailPath, loginRedirectState, paths } from '@/routes/paths'

type MarketScene = 'offline' | 'delay' | 'closed'

const BEIJING_TIME_ZONE = 'Asia/Shanghai'
const beijingFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: BEIJING_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

/** 顶部时间统一按北京时间展示，不随设备时区变化 */
function getBeijingNow(date: Date) {
  const parts = beijingFormatter.formatToParts(date)
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00'
  return {
    date: `${pick('year')}-${pick('month')}-${pick('day')}`,
    time: `${pick('hour')}:${pick('minute')}:${pick('second')}`,
    hour: Number(pick('hour')),
  }
}

function buyProductFor(grams: number) {
  return productForGrams(grams).id
}

export function MarketPage() {
  const [params] = useSearchParams()
  const demo = params.get('demo')

  return (
    <TabPage>
      <QuoteView demo={demo} />
    </TabPage>
  )
}

// ============ 行情 ============

function QuoteView({ demo }: { demo: string | null }) {
  const navigate = useNavigate()
  const [watchlist, setWatchlist] = useState<string[]>(() => readWatchlist())
  const [riskAckedReal, setRiskAcked] = useState<boolean>(() => readRiskAck())
  const [manageOpen, setManageOpen] = useState(false)
  const [subscribeOpen, setSubscribeOpen] = useState(false)
  const [subscription, setSubscription] = useState(() => readPriceSubscription())
  const [gate, setGate] = useState<'login' | 'verify' | null>(null)
  const [member] = useState(() => readMember())

  const scene: MarketScene | null =
    demo === 'offline' || demo === 'delay' || demo === 'closed' ? demo : null
  const { values: reviewValues } = useReviewState('market')
  const reviewPhase = reviewValues.phase ?? 'auto'
  /** 评审开关优先，其次跟随真实登录 / 实名 / 订阅状态，仅影响展示分支 */
  const loggedIn =
    reviewValues.account === 'guest'
      ? false
      : reviewValues.account === 'member'
        ? true
        : Boolean(member)
  const verified =
    reviewValues.verify === 'none'
      ? false
      : reviewValues.verify === 'personal'
        ? true
        : isMemberVerified(member)
  const subscribed =
    reviewValues.subscription === 'none'
      ? false
      : reviewValues.subscription === 'subscribed'
        ? true
        : Boolean(subscription)
  const targetPrice = subscription?.targetPrice ?? defaultTargetPrice(getLivePrice('au9999'))
  const riskAcked =
    reviewValues.risk === 'pending' ? false : reviewValues.risk === 'acked' ? true : riskAckedReal

  /** 订阅入口：未登录先引导登录，已登录未实名先引导实名 */
  const openSubscribe = () => {
    if (!loggedIn) {
      setGate('login')
      return
    }
    if (!verified) {
      setGate('verify')
      return
    }
    setSubscribeOpen(true)
  }

  /** 交易入口需登录：未登录直接去登录页，登录后回跳当前页 */
  const requireLogin = (action: () => void) => {
    if (!loggedIn) {
      navigate(paths.login, { state: loginRedirectState() })
      return
    }
    action()
  }

  useMarketTicker(scene === null && reviewPhase !== 'closed')

  /** 统一顶部横幅的实时时钟（每秒更新一次） */
  const [clock, setClock] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const beijingNow = getBeijingNow(clock)
  const dateStr = `${beijingNow.date} ${beijingNow.time}`

  /** 开市状态：评审开关优先，其次按演示场景与真实时间判断（北京时间 9:00-24:00 开市） */
  const isClosed = scene === 'closed' || reviewPhase === 'closed'
  const isOffline = scene === 'offline'
  const nowHour = beijingNow.hour
  const marketOpen =
    !isClosed && !isOffline && (reviewPhase === 'open' || (scene === null && nowHour >= 9))

  return (
    <>
      <div className={cn('space-y-4', !riskAcked && 'pointer-events-none opacity-50')}>
        {scene === 'offline' ? (
          <InlineNotice tone="danger" title="网络连接已断开">
            正在重连，价格停止更新，恢复后自动继续刷新。
          </InlineNotice>
        ) : null}

        {/* 统一顶部横幅：交易日 + 开盘状态（铺满吸顶） */}
        <div className="-mx-4 -mt-4 sticky top-0 z-10 flex items-center gap-3 border-b border-border-subtle bg-price px-4 py-2 text-caption text-paper">
          <span className="tabular">{dateStr}</span>
          <span className="inline-flex items-center gap-1">
            {isOffline ? '断网' : isClosed || !marketOpen ? '休市' : '开盘中'}
          </span>
        </div>

        {/* 订阅提醒：单行不换行，已订阅时展示目标价与「已订阅」按钮 */}
        <div className="flex items-center gap-2 rounded-lg bg-gold-50 px-3 py-2">
          <p className="min-w-0 flex-1 truncate text-caption text-foreground">
            {subscribed ? (
              <>
                已开启金价提醒，提醒价
                <span className="tabular text-gold-700">{targetPrice.toFixed(2)}</span>
                元/克。
              </>
            ) : (
              '金价波动，开启提醒不错过关键行情。'
            )}
          </p>
          <Button variant="secondary" size="sm" className="shrink-0" onClick={openSubscribe}>
            {subscribed ? '已订阅' : '订阅提醒'}
          </Button>
        </div>

        {/* 金价走势：国内 / 国际可展开分时走势 */}
        <PriceTrendCard />

        <TradeCard
          scene={scene}
          marketOpen={marketOpen}
          onBuy={(grams) => requireLogin(() => navigate(buyDetailPath(buyProductFor(grams))))}
          onMore={() => navigate(paths.buy)}
        />

        <NewsSummaryCard
          onOpenDetail={(id) => navigate(`/market/news/${id}`)}
          onMore={() => navigate('/market/news')}
        />
      </div>

      <RiskDialog
        open={!riskAcked}
        onConfirm={() => {
          writeRiskAck()
          setRiskAcked(true)
        }}
      />

      <ManageSheet
        open={manageOpen}
        watchlist={watchlist}
        onClose={() => setManageOpen(false)}
        onChange={() => setWatchlist(readWatchlist())}
      />

      <PriceSubscribeSheet
        open={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
        onChanged={() => setSubscription(readPriceSubscription())}
      />

      <ConfirmDialog
        open={gate === 'login'}
        title="请先登录"
        description="登录后可订阅金价提醒，第一时间收到行情变动通知。"
        confirmText="去登录"
        cancelText="暂不"
        onConfirm={() => {
          setGate(null)
          navigate(paths.login, { state: loginRedirectState() })
        }}
        onClose={() => setGate(null)}
      />

      <ConfirmDialog
        open={gate === 'verify'}
        title="请先完成实名认证"
        description="根据监管要求，订阅金价提醒前需完成实名认证。"
        confirmText="去实名认证"
        cancelText="暂不"
        onConfirm={() => {
          setGate(null)
          navigate(paths.meAuth)
        }}
        onClose={() => setGate(null)}
      />
    </>
  )
}

/** 金价走势：国内 / 国际展开分时走势，黄金实物展开投资金条报价 */
function PriceTrendCard() {
  const [expanded, setExpanded] = useState<'domestic' | 'international' | 'retail' | null>(
    'domestic',
  )
  const domesticQuote = quoteByCode('au9999')!
  const internationalQuote = quoteByCode('xau')!
  const domestic = quoteChange(domesticQuote)
  const international = quoteChange(internationalQuote)
  const toneOf = (pct: number) => (pct >= 0 ? 'text-price' : 'text-success')
  const percentOf = (pct: number) => `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`
  /** 黄金实物价 = 国内实时金价 + 固定加价 */
  const retailPrice = round2(domestic.price + RETAIL_GOLD.premium)

  const columns = [
    {
      key: 'domestic' as const,
      label: '国内金价',
      price: domestic.price.toFixed(2),
      sub: percentOf(domestic.changePct),
      tone: toneOf(domestic.changePct),
      subTone: toneOf(domestic.changePct),
    },
    {
      key: 'international' as const,
      label: '国际金价',
      price: international.price.toFixed(2),
      sub: percentOf(international.changePct),
      tone: toneOf(international.changePct),
      subTone: toneOf(international.changePct),
    },
    {
      key: 'retail' as const,
      label: '黄金实物',
      price: retailPrice.toFixed(2),
      sub: RETAIL_GOLD.brand,
      tone: 'text-gold-700',
      subTone: 'text-subtle-foreground',
    },
  ]

  const expandedQuote = expanded === 'international' ? internationalQuote : domesticQuote

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-card-title text-foreground">金价走势</h2>
        <span className="text-caption text-subtle-foreground">实时</span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border-subtle">
        {columns.map((column) => {
          const open = expanded === column.key

          const body = (
            <>
              <span className="flex items-center gap-0.5 text-caption text-subtle-foreground">
                {column.label}
                {open ? (
                  <ChevronUp size={12} aria-hidden="true" />
                ) : (
                  <ChevronDown size={12} aria-hidden="true" />
                )}
              </span>
              <span className={cn('mt-0.5 block tabular text-section', column.tone)}>
                {column.price}
              </span>
              <span className={cn('block text-caption', column.subTone)}>{column.sub}</span>
            </>
          )

          return (
            <button
              key={column.key}
              type="button"
              onClick={() => setExpanded((current) => (current === column.key ? null : column.key))}
              aria-expanded={open}
              aria-label={`${column.label} ${column.price} ${column.sub}，${
                open ? '收起详情' : '展开详情'
              }`}
              className="px-2.5 text-left first:pl-0 last:pr-0"
            >
              {body}
            </button>
          )
        })}
      </div>

      {expanded ? (
        <div className="relative rounded-lg bg-gold-50 p-3">
          <span
            aria-hidden="true"
            className="absolute -top-1.5 h-3 w-3 rotate-45 rounded-sm bg-gold-50"
            style={{
              left: `calc(${
                expanded === 'domestic' ? 16.6 : expanded === 'international' ? 50 : 83.3
              }% - 6px)`,
            }}
          />
          {expanded === 'retail' ? (
            <BarPricePanel basePrice={domestic.price} />
          ) : (
            <TrendPanel key={expanded} quote={expandedQuote} />
          )}
        </div>
      ) : null}

      <div className="flex w-full items-center gap-2 rounded-md bg-gold-50 px-3 py-2 text-left">
        <span className="flex-1 text-caption text-foreground">
          黄金价格波动，盈亏由用户自行承担
        </span>
      </div>
    </Card>
  )
}

const TREND_PANEL_NAME: Record<string, string> = {
  au9999: '黄金9999',
  xau: '伦敦金',
}

/** 黄金实物展开：投资金条按克重分档报价，销售价 =（实物金价 + 工费）× 克重 */
function BarPricePanel({ basePrice }: { basePrice: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-body-strong text-foreground">投资金条</span>
        <span className="text-caption text-subtle-foreground">实时金价随国内金价变动</span>
      </div>

      <div className="grid grid-cols-4 gap-1 text-micro text-subtle-foreground">
        <span>克重</span>
        <span className="text-right">实时金价</span>
        <span className="text-right">工费/克</span>
        <span className="text-right">销售价（元）</span>
      </div>

      <div className="divide-y divide-gold-100">
        {BAR_PRICE_TIERS.map((tier) => (
          <div
            key={tier.grams}
            className="grid grid-cols-4 gap-1 py-1.5 text-caption tabular text-foreground"
          >
            <span>{tier.grams}</span>
            <span className="text-right">{basePrice.toFixed(2)}</span>
            <span className="text-right text-price">{tier.fee}</span>
            <span className="text-right">{salePriceOf(tier.grams, basePrice).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 展开面板：开收价 + 十字光标走势图 + 时间档位 */
function TrendPanel({ quote }: { quote: Quote }) {
  const [range, setRange] = useState<TrendRange>('分时')
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const price = getLivePrice(quote.code)
  const series = useMemo(
    () => buildTrendSeries(quote.code, range, price),
    [quote.code, range, price],
  )
  const glossary = QUOTE_GLOSSARY[quote.code]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-body-strong text-foreground">
          {TREND_PANEL_NAME[quote.code] ?? quote.name}
        </span>
        {glossary ? (
          <button
            type="button"
            onClick={() => setGlossaryOpen(true)}
            aria-label={`查看${TREND_PANEL_NAME[quote.code] ?? quote.name}词条解释`}
            className="inline-flex text-subtle-foreground transition active:opacity-60"
          >
            <Info size={12} aria-hidden="true" />
          </button>
        ) : null}
        <span className="ml-auto text-caption text-subtle-foreground">{quote.unit}</span>
      </div>

      <div className="flex items-baseline justify-between text-caption text-subtle-foreground">
        <span>
          今开：
          <span className="tabular text-foreground">{quote.open.toFixed(quote.precision)}</span>
        </span>
        <span>
          昨收：
          <span className="tabular text-foreground">
            {quote.prevClose.toFixed(quote.precision)}
          </span>
        </span>
      </div>

      <TrendChart series={series} />

      <div className="grid grid-cols-5 gap-1">
        {TREND_RANGES.map((item) => (
          <Chip
            key={item}
            active={item === range}
            onClick={() => setRange(item)}
            className="h-7 justify-center px-0 text-caption"
          >
            {item}
          </Chip>
        ))}
      </div>

      <BottomSheet
        open={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
        title="词条解释"
        footer={
          <Button className="w-full" onClick={() => setGlossaryOpen(false)}>
            好的
          </Button>
        }
      >
        <p className="text-body leading-relaxed text-foreground">{glossary}</p>
      </BottomSheet>
    </div>
  )
}

/** 走势折线：左侧价位刻度 + 横向网格，拖动时展示十字光标 */
function TrendChart({ series }: { series: ChartPoint[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const values = series.map((point) => point.price)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const ticks = Array.from({ length: 5 }, (_, index) => max - (span / 4) * index)
  const yOf = (value: number) => 100 - ((value - min) / span) * 100
  const linePath = series
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${((index / Math.max(1, series.length - 1)) * 100).toFixed(2)} ${yOf(point.price).toFixed(2)}`,
    )
    .join(' ')
  const middle = series[Math.floor(series.length / 2)]

  const activePoint = activeIndex === null ? null : series[activeIndex]

  /** 按触点横坐标换算最近的数据点，拖动和点击都走这里 */
  const pickByClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    setActiveIndex(Math.round(ratio * (series.length - 1)))
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex w-12 shrink-0 flex-col justify-between text-right text-micro tabular text-subtle-foreground">
          {ticks.map((tick) => (
            <span key={tick}>{tick.toFixed(2)}</span>
          ))}
        </div>
        <div
          ref={trackRef}
          role="presentation"
          onPointerDown={(event) => {
            draggingRef.current = true
            event.currentTarget.setPointerCapture(event.pointerId)
            pickByClientX(event.clientX)
          }}
          onPointerMove={(event) => {
            if (!draggingRef.current) return
            pickByClientX(event.clientX)
          }}
          onPointerUp={() => {
            draggingRef.current = false
            setActiveIndex(null)
          }}
          onPointerCancel={() => {
            draggingRef.current = false
            setActiveIndex(null)
          }}
          className="relative h-32 flex-1 touch-none select-none"
        >
          {ticks.map((tick, index) => (
            <span
              key={tick}
              aria-hidden="true"
              className="absolute inset-x-0 border-t border-border-subtle"
              style={{ top: `${(index / 4) * 100}%` }}
            />
          ))}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              className="text-gold-600"
            />
          </svg>

          {activeIndex !== null && activePoint ? (
            <>
              <span
                aria-hidden="true"
                className="absolute inset-y-0 w-px bg-gold-600/70"
                style={{ left: `${(activeIndex! / Math.max(1, series.length - 1)) * 100}%` }}
              />
              <span
                aria-hidden="true"
                className="absolute inset-x-0 border-t border-dashed border-gold-400/70"
                style={{ top: `${yOf(activePoint.price)}%` }}
              />
              <span
                aria-hidden="true"
                className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-600 ring-2 ring-gold-50"
                style={{
                  left: `${(activeIndex! / Math.max(1, series.length - 1)) * 100}%`,
                  top: `${yOf(activePoint.price)}%`,
                }}
              />
            </>
          ) : null}
        </div>
      </div>
      <div className="mt-1 flex justify-between pl-14 text-micro tabular text-subtle-foreground">
        <span>{series[0]?.label}</span>
        <span>{middle?.label}</span>
        <span>{series[series.length - 1]?.label}</span>
      </div>
    </div>
  )
}

/** 3 秒模拟刷新：与全站金价订阅共用同一节拍，页面隐藏时暂停 */
function useMarketTicker(enabled: boolean) {
  const [, force] = useReducer((value: number) => value + 1, 0)

  useEffect(() => {
    if (!enabled) return
    return subscribeGoldPrice(() => force())
  }, [enabled])
}

function RelatedCard({ onTip }: { onTip: (message: string) => void }) {
  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-card-title text-foreground">关联品种</p>
        <span className="text-caption text-subtle-foreground">数据仅供参考</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {RELATED_PRODUCTS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onTip('该品种暂不支持交易')}
            className="rounded-md bg-surface-2 px-3 py-2 text-left transition active:bg-muted"
          >
            <p className="text-caption text-subtle-foreground">{item.name}</p>
            <p className="mt-0.5 text-body-strong tabular text-foreground">
              {item.price.toFixed(item.precision)}
            </p>
            <p
              className={cn(
                'mt-0.5 text-caption tabular',
                item.changePct >= 0 ? 'text-price' : 'text-success',
              )}
            >
              {item.changePct >= 0 ? '+' : ''}
              {item.changePct.toFixed(2)}%
            </p>
          </button>
        ))}
      </div>

      <div className="border-t border-border-subtle pt-3">
        <p className="text-caption text-subtle-foreground">人民币汇率</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {FX_RATES.map((item) => (
            <div key={item.key} className="rounded-md bg-surface-2 px-3 py-2">
              <p className="text-caption text-subtle-foreground">{item.name}</p>
              <p className="mt-0.5 text-body-strong tabular text-foreground">
                {item.value.toFixed(4)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

/** 行情交易卡固定展示 5 个常用规格，更多规格引导到买金页 */
const TRADE_TABLE_SPECS = [5, 10, 20, 50, 100]

function TradeCard({
  scene,
  marketOpen,
  onBuy,
  onMore,
}: {
  scene: MarketScene | null
  marketOpen: boolean
  onBuy: (grams: number) => void
  onMore: () => void
}) {
  const [grams, setGrams] = useState(DEFAULT_TRADE_GRAMS)
  const buyPrice = getLivePrice('platform-buy')
  const buyTotal = salePriceOf(grams, buyPrice)
  const locked = scene !== null || !marketOpen
  const reason =
    scene === 'offline'
      ? '网络异常，暂时无法下单'
      : scene === 'delay'
        ? '行情数据延迟，暂不可下单'
        : scene === 'closed' || !marketOpen
          ? '当前休市，开市后可交易'
          : ''

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-card-title text-foreground">宏恩泽 · 投资金</p>
        <span className="shrink-0 rounded-sm bg-gold-50 px-1.5 py-0.5 text-micro text-gold-800 ring-1 ring-gold-200">
          实时报价
        </span>
      </div>

      <div className="overflow-hidden rounded-md ring-1 ring-border-subtle">
        <div className="grid grid-cols-4 gap-1 bg-surface-2 px-3 py-2 text-micro text-subtle-foreground">
          <span>克重</span>
          <span className="text-right">实时金价</span>
          <span className="text-right">工费/克</span>
          <span className="text-right">销售价（元）</span>
        </div>
        <div className="divide-y divide-border-subtle">
          {TRADE_TABLE_SPECS.map((spec) => {
            const active = spec === grams
            return (
              <button
                key={spec}
                type="button"
                aria-pressed={active}
                onClick={() => setGrams(spec)}
                className={cn(
                  'grid w-full grid-cols-4 items-center gap-1 px-3 py-2 text-left text-caption tabular transition',
                  active ? 'bg-gold-50' : 'text-foreground/80 active:bg-surface-2',
                )}
              >
                <span
                  className={cn('text-body-strong', active ? 'text-gold-800' : 'text-foreground')}
                >
                  {spec}克
                </span>
                <span className="text-right">{buyPrice.toFixed(2)}</span>
                <span className="text-right text-price">{feePerGram(spec)}</span>
                <span className="text-right">{salePriceOf(spec, buyPrice).toFixed(2)}</span>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={onMore}
          className="flex w-full items-center justify-between gap-2 border-t border-border-subtle px-3 py-2.5 text-caption text-gold-700 transition active:bg-surface-2"
        >
          选购更多规格
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-border-subtle pt-2.5">
        <span className="text-caption text-subtle-foreground">合计 · {grams}克</span>
        <p className="text-body-strong tabular text-foreground">¥{buyTotal.toFixed(2)}</p>
      </div>

      {/* 休市提示统一收敛到主按钮上，不再单独占一行 */}
      {locked && reason !== '当前休市，开市后可交易' ? (
        <p className="text-caption text-warning">{reason}</p>
      ) : null}

      <Button variant="primary" size="md" block disabled={locked} onClick={() => onBuy(grams)}>
        {locked
          ? reason === '当前休市，开市后可交易'
            ? '当前休市，开市后可交易'
            : '暂不可买入'
          : '立即买入'}
      </Button>
    </Card>
  )
}

function AlertsCard({
  alerts,
  onAdd,
  onDelete,
}: {
  alerts: PriceAlert[]
  onAdd: () => void
  onDelete: (id: string) => void
}) {
  const pending = alerts.filter((alert) => alert.status === 'pending')

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-card-title text-foreground">我的提醒</p>
          {pending.length > 0 ? <Badge tone="primary">{pending.length}</Badge> : null}
        </div>
        <TextLink onClick={onAdd} tone="primary">
          设提醒
        </TextLink>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-md bg-surface-2 px-3 py-3 text-center">
          <p className="text-body text-muted-foreground">还没有到价提醒</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={onAdd}>
            设置提醒
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => {
            const unit = quoteByCode(alert.code)?.unit ?? ''
            return (
              <li key={alert.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-body text-foreground">{quoteName(alert.code)}</p>
                  <p className="mt-0.5 text-caption text-subtle-foreground tabular">
                    {ALERT_DIRECTION_LABEL[alert.direction]} {alert.target.toFixed(2)} {unit} ·{' '}
                    {formatDateTime(alert.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Badge tone={alert.status === 'pending' ? 'info' : 'success'}>
                    {alert.status === 'pending' ? '待触发' : '已触发'}
                  </Badge>
                  <IconButton icon={Trash2} label="删除提醒" onClick={() => onDelete(alert.id)} />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="text-caption text-subtle-foreground">
        提醒仅在打开行情页时本地校验，不发送系统通知。
      </p>
    </Card>
  )
}

function AlertSheet({
  open,
  quote,
  onClose,
  onSaved,
}: {
  open: boolean
  quote: Quote
  onClose: () => void
  onSaved: () => void
}) {
  const price = getLivePrice(quote.code)
  const priceRef = useRef(price)
  priceRef.current = price

  const [direction, setDirection] = useState<'above' | 'below'>('above')
  const [target, setTarget] = useState('')
  const [serverError, setServerError] = useState('')
  const [directionLocked, setDirectionLocked] = useState(false)

  useEffect(() => {
    if (!open) return
    setDirection('above')
    setTarget((priceRef.current + 2).toFixed(2))
    setServerError('')
    setDirectionLocked(false)
  }, [open])

  const updateTarget = (value: string) => {
    setTarget(value)
    setServerError('')
    if (directionLocked) return
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) {
      setDirection(parsed >= priceRef.current ? 'above' : 'below')
    }
  }

  const targetValid = /^\d+(\.\d{1,2})?$/.test(target.trim()) && Number(target) > 0
  const error =
    serverError ||
    (target.trim() !== '' && !targetValid ? '请输入正确的目标价（最多 2 位小数）' : '')

  const save = () => {
    if (!targetValid) return
    const result = addAlert({ code: quote.code, direction, target: Number(target) })
    if (!result.ok) {
      setServerError(
        result.reason === 'limit'
          ? `该标的最多设置 ${ALERT_LIMIT} 条提醒，请先删除`
          : '该目标价已存在提醒',
      )
      return
    }
    onSaved()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="设置到价提醒"
      subtitle={`${quote.name} 当前 ${price.toFixed(quote.precision)} ${quote.unit}`}
      footer={
        <Button block onClick={save} disabled={!targetValid}>
          保存提醒
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-caption text-subtle-foreground">提醒条件</p>
          <div className="mt-1.5 flex gap-2">
            {(['above', 'below'] as const).map((item) => (
              <Chip
                key={item}
                active={direction === item}
                onClick={() => {
                  setDirection(item)
                  setDirectionLocked(true)
                  setServerError('')
                }}
              >
                {item === 'above' ? '价格高于' : '价格低于'}
              </Chip>
            ))}
          </div>
        </div>

        <FormField
          label="目标价"
          value={target}
          onChange={updateTarget}
          unit={quote.unit}
          inputMode="decimal"
          placeholder="请输入目标价"
          error={error || undefined}
          hint={`目标价最多 2 位小数，当前价 ${price.toFixed(quote.precision)}`}
        />

        <InlineNotice tone="info">
          同一标的最多同时存在 {ALERT_LIMIT} 条待触发提醒，提醒触达仅在本页内提示。
        </InlineNotice>
      </div>
    </BottomSheet>
  )
}

function ManageSheet({
  open,
  watchlist,
  onClose,
  onChange,
}: {
  open: boolean
  watchlist: string[]
  onClose: () => void
  onChange: () => void
}) {
  const quotes = watchlist
    .map((code) => quoteByCode(code))
    .filter((item): item is Quote => Boolean(item))

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="管理自选"
      subtitle={`已添加 ${quotes.length} / ${WATCH_LIMIT}`}
      footer={
        quotes.length > 0 ? (
          <Button
            variant="danger"
            block
            onClick={() => {
              clearWatchlist()
              onChange()
              onClose()
            }}
          >
            全部清空
          </Button>
        ) : undefined
      }
    >
      {quotes.length === 0 ? (
        <p className="py-6 text-center text-body text-subtle-foreground">还没有自选标的</p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {quotes.map((item) => (
            <li key={item.code} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="text-body text-foreground">{item.name}</p>
                <p className="mt-0.5 text-caption text-subtle-foreground tabular">
                  {getLivePrice(item.code).toFixed(item.precision)} {item.unit}
                </p>
              </div>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => {
                  removeWatch(item.code)
                  onChange()
                }}
              >
                移除
              </Button>
            </li>
          ))}
        </ul>
      )}
    </BottomSheet>
  )
}

function RiskDialog({ open, onConfirm }: { open: boolean; onConfirm: () => void }) {
  const [checked, setChecked] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  useDialogGuard({ open, onClose: () => {}, panelRef, historyKey: '__market-risk' })

  if (!open) return null

  const content = (
    <>
      <div className="absolute inset-0 z-50 flex items-center justify-center px-6">
        <div className="absolute inset-0 bg-black/45" />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="投资风险提示"
          tabIndex={-1}
          className="relative w-full max-w-80 rounded-lg bg-card p-4 shadow-lg outline-none"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-warning" />
            <h2 className="text-card-title text-foreground">投资风险提示</h2>
          </div>
          <p className="mt-2 text-body leading-relaxed text-muted-foreground">{RISK_TEXT}</p>
          <AgreementCheck checked={checked} onChange={setChecked} className="mt-3">
            我已阅读并理解以上风险提示
          </AgreementCheck>
          <Button
            block
            className="mt-3"
            onClick={() => {
              if (!checked) {
                setToast('请先勾选并同意投资风险提示')
                return
              }
              onConfirm()
            }}
          >
            继续查看
          </Button>
        </div>
      </div>
      <Toast open={!!toast} message={toast ?? ''} onClose={() => setToast(null)} />
    </>
  )

  const host = document.querySelector<HTMLElement>('[data-phone-frame]')
  return host ? createPortal(content, host) : content
}

// ============ 资讯摘要卡片（行情页底部） ============

function NewsSummaryCard({
  onOpenDetail,
  onMore,
}: {
  onOpenDetail: (id: string) => void
  onMore: () => void
}) {
  const list = useMemo(() => sortedNews().slice(0, 3), [])

  if (list.length === 0) return null

  return (
    <Card padding="md" className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper size={16} className="text-gold-700" />
          <p className="text-card-title text-foreground">资讯与解读</p>
        </div>
        <button
          type="button"
          onClick={onMore}
          className="inline-flex items-center gap-0.5 text-caption text-primary-active transition active:opacity-70"
        >
          更多
          <span aria-hidden>›</span>
        </button>
      </div>

      <ul className="divide-y divide-border-subtle">
        {list.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onOpenDetail(item.id)}
              className="flex w-full items-start gap-2 py-2 text-left transition active:bg-surface-2"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-600" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-body text-foreground">{item.title}</p>
                <p className="mt-0.5 text-caption text-subtle-foreground tabular">
                  {item.publishedAt}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <p className="text-right text-caption text-subtle-foreground">{NEWS_DISCLAIMER}</p>
    </Card>
  )
}
