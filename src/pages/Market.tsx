import {
  AgreementCheck,
  Badge,
  BottomSheet,
  Button,
  Card,
  Chip,
  ChipRow,
  FormField,
  IconButton,
  InlineNotice,
  SegmentedTabs,
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
  CHART_PERIODS,
  DEFAULT_QUOTE_CODE,
  DEFAULT_QUOTE_TAB,
  DEFAULT_TRADE_GRAMS,
  DOMESTIC_CONTRACTS,
  FX_RATES,
  INTERNATIONAL_CONTRACTS,
  MARKET_QUOTES,
  NEWS_DISCLAIMER,
  PHYSICAL_METALS,
  PHYSICAL_QUOTE_DISCLAIMER,
  QUOTE_TABS,
  RELATED_PRODUCTS,
  RISK_NOTE,
  RISK_TEXT,
  TRADE_SPECS,
  WATCH_LIMIT,
  addAlert,
  addWatch,
  buildCandles,
  buildLineSeries,
  clearWatchlist,
  getLivePrice,
  getMarketLastUpdatedAt,
  quoteByCode,
  quoteChange,
  quoteName,
  readRiskAck,
  readWatchlist,
  removeAlert,
  removeWatch,
  simulateMarketTick,
  sortedNews,
  writeRiskAck,
  type ChartPeriod,
  type DomesticContract,
  type InternationalContract,
  type PhysicalMetal,
  type PriceAlert,
  type Quote,
  type QuoteTab,
} from '@/mocks/market'
import { Bell, Newspaper, ShieldAlert, Star, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useId, useMemo, useReducer, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { buyDetailPath, paths } from '@/routes/paths'

type MarketScene = 'offline' | 'delay' | 'closed'
type ChartMode = 'line' | 'candle'

/** 选中的标的放在模块级，切其它 Tab 再切回来不重置 */
let lastQuoteCode = DEFAULT_QUOTE_CODE

function formatHms(timestamp: number) {
  return getBeijingNow(new Date(timestamp)).time
}

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
  return grams <= 10 ? 'bar-sheet' : 'bar-trapezoid'
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
  const [quoteTab, setQuoteTab] = useState<QuoteTab>(DEFAULT_QUOTE_TAB)
  const [watchlist, setWatchlist] = useState<string[]>(() => readWatchlist())
  const [riskAcked, setRiskAcked] = useState<boolean>(() => readRiskAck())
  const [manageOpen, setManageOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const scene: MarketScene | null =
    demo === 'offline' || demo === 'delay' || demo === 'closed' ? demo : null
  const { values: reviewValues } = useReviewState('market')
  const reviewPhase = reviewValues.phase ?? 'auto'

  /** 卡片 2 固定展示 Au99.99 的概览 + 图表；TradeCard 固定展示 platform-buy */
  const chartQuote = quoteByCode('au9999')!
  const tradeQuote = quoteByCode('platform-buy')!

  useMarketTicker(scene === null && reviewPhase !== 'closed', () => {})

  const showToast = (message: string) => {
    setToast(message)
    setToastOpen(true)
  }

  useEffect(() => {
    lastQuoteCode = chartQuote.code
  }, [chartQuote.code])

  const watched = watchlist.includes(chartQuote.code)

  const toggleWatch = () => {
    if (watched) {
      removeWatch(chartQuote.code)
      setWatchlist(readWatchlist())
      showToast('已移出自选')
      return
    }
    if (addWatch(chartQuote.code) === 'limit') {
      showToast(`自选最多 ${WATCH_LIMIT} 个，请先移除`)
      return
    }
    setWatchlist(readWatchlist())
    showToast('已加入自选')
  }

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

        {/* 卡片 1：行情概览 —— 三选一表格（实物价格 / 上金所行情 / 国际现货） */}
        <Card padding="none" className="overflow-hidden">
          <SegmentedTabs
            items={QUOTE_TABS.map((item) => ({ value: item.value, label: item.label }))}
            value={quoteTab}
            onChange={(value) => setQuoteTab(value as QuoteTab)}
            variant="underline"
            fill
            className="-mx-0 bg-card px-3"
          />
          {quoteTab === 'physical' ? (
            <PhysicalMetalTable
              locked={scene !== null || !marketOpen}
              onBuy={() => navigate('/buy')}
              onSell={() => navigate('/orders?type=recycle')}
            />
          ) : quoteTab === 'domestic' ? (
            <DomesticContractsTable
              onSelect={(code) => showToast(`${quoteName(code)} 详情页待开放`)}
            />
          ) : (
            <InternationalContractsTable
              onSelect={(code) => showToast(`${quoteName(code)} 详情页待开放`)}
            />
          )}
        </Card>

        {/* 卡片 2：图表分析（固定 Au99.99，不随卡片 1 切换） */}
        <Card padding="none" className="space-y-3 overflow-hidden">
          <div className="space-y-3 px-3 pt-3">
            <OverviewCard
              quote={chartQuote}
              watched={watched}
              scene={scene}
              onToggleWatch={toggleWatch}
              onAlert={() => navigate(paths.marketAlertSettings)}
            />
          </div>
          <div className="px-3 pb-3">
            <ChartCard quote={chartQuote} />
          </div>
        </Card>

        <TradeCard
          scene={scene}
          marketOpen={marketOpen}
          onBuy={(grams) => navigate(buyDetailPath(buyProductFor(grams)))}
          onSell={(grams) => navigate(`${paths.quote}?category=bar&weight=${grams}`)}
        />

        <p className="px-1 text-center text-caption text-subtle-foreground">{RISK_NOTE}</p>

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

      <Toast open={toastOpen} message={toast} onClose={() => setToastOpen(false)} />
    </>
  )
}

/** 5 秒模拟刷新；页面隐藏时暂停，回到前台立即补一次 */
function useMarketTicker(enabled: boolean, onTick: () => void) {
  const [, force] = useReducer((value: number) => value + 1, 0)
  const onTickRef = useRef(onTick)
  onTickRef.current = onTick

  useEffect(() => {
    if (!enabled) return
    const tick = () => {
      simulateMarketTick()
      onTickRef.current()
      force()
    }
    const timer = window.setInterval(() => {
      if (!document.hidden) tick()
    }, 5000)
    const onVisible = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [enabled])
}

function PhysicalMetalTable({
  locked,
  onBuy,
  onSell,
}: {
  locked: boolean
  onBuy: () => void
  onSell: () => void
}) {
  /** 黄金行与「报价与交易」卡共用平台金条实时价，避免同页出现两套金价口径 */
  const goldBuyQuote = quoteByCode('platform-buy')!
  const goldSale = getLivePrice('platform-buy')
  const goldBuyback = getLivePrice('platform-recycle')
  const goldHigh = Math.max(goldBuyQuote.high, goldSale, goldBuyback)
  const goldLow = Math.min(goldBuyQuote.low, goldSale, goldBuyback)

  const fmt = (metal: PhysicalMetal, value: number | null) =>
    value == null ? '--' : value.toFixed(metal.precision)

  return (
    <>
      {/* 表头 */}
      <div className="grid grid-cols-[1fr_90px_90px_56px] items-center gap-x-1 px-3 py-2.5 text-caption text-subtle-foreground bg-surface-2">
        <span>商品</span>
        <span className="tabular text-center">回购</span>
        <span className="tabular text-center">销售</span>
        <span className="tabular text-right">高/低</span>
      </div>

      {/* 数据行 */}
      <ul className="divide-y divide-border-subtle">
        {PHYSICAL_METALS.map((metal) => {
          const isGold = metal.name === '黄金'
          const buyback = fmt(metal, isGold ? goldBuyback : metal.buyback)
          const sale = fmt(metal, isGold ? goldSale : metal.sale)
          const highStr = fmt(metal, isGold ? goldHigh : metal.high)
          const lowStr = fmt(metal, isGold ? goldLow : metal.low)
          const hasBuyback = metal.buyback != null
          const hasSale = metal.sale != null
          return (
            <li
              key={metal.name}
              className="grid grid-cols-[1fr_90px_90px_56px] items-center gap-x-1 px-3 py-3"
            >
              {/* 商品名 */}
              <p className="text-body-strong text-gold-700">{metal.name}</p>

              {/* 回购列：黄金行有按钮，其余行只有价格 */}
              <div className="flex flex-col items-center gap-0.5">
                <p
                  className={cn(
                    'text-body-strong tabular leading-tight',
                    hasBuyback ? 'text-success' : 'text-subtle-foreground',
                  )}
                >
                  {buyback}
                </p>
                {isGold && hasBuyback ? (
                  <button
                    type="button"
                    onClick={onSell}
                    disabled={locked}
                    className="rounded-sm border border-success/50 px-2 py-0.5 text-micro leading-none text-success hover:bg-success/10 active:bg-success/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    卖出
                  </button>
                ) : (
                  <span className="h-4" />
                )}
              </div>

              {/* 销售列：黄金行有按钮，其余行只有价格 */}
              <div className="flex flex-col items-center gap-0.5">
                <p
                  className={cn(
                    'text-body-strong tabular leading-tight',
                    hasSale ? 'text-price' : 'text-subtle-foreground',
                  )}
                >
                  {sale}
                </p>
                {isGold && hasSale ? (
                  <button
                    type="button"
                    onClick={onBuy}
                    disabled={locked}
                    className="rounded-sm border border-price/50 px-2 py-0.5 text-micro leading-none text-price hover:bg-price/10 active:bg-price/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    买入
                  </button>
                ) : (
                  <span className="h-4" />
                )}
              </div>

              {/* 高/低 */}
              <div className="text-right tabular">
                <span
                  className={cn(
                    'block text-caption leading-tight',
                    metal.high != null ? 'text-price' : 'text-subtle-foreground',
                  )}
                >
                  {highStr}
                </span>
                <span
                  className={cn(
                    'block text-caption leading-tight',
                    metal.low != null ? 'text-success' : 'text-subtle-foreground',
                  )}
                >
                  {lowStr}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="border-t border-border-subtle px-3 py-2 text-caption text-subtle-foreground">
        黄金为平台投资金条实时挂牌价，与下方报价卡口径一致；其余为实物挂牌参考价。
      </p>
    </>
  )
}

// ============ 卡片 1 tab 2：上金所行情 ============

function DomesticContractsTable({ onSelect }: { onSelect: (code: string) => void }) {
  const fmtNum = (v: number | null, prec: number) => (v == null ? '--' : v.toFixed(prec))

  return (
    <>
      {/* 表头：商品 | 卖出 | 买入 | 高/低 */}
      <div className="grid grid-cols-[1fr_90px_90px_72px] items-center gap-x-1 bg-surface-2 px-3 py-2.5 text-caption text-subtle-foreground">
        <span>商品</span>
        <span className="tabular text-center">卖出</span>
        <span className="tabular text-center">买入</span>
        <span className="tabular text-right">高/低</span>
      </div>

      {/* 数据行 */}
      <ul className="divide-y divide-border-subtle">
        {DOMESTIC_CONTRACTS.map((contract) => {
          const sellStr = fmtNum(contract.sell, contract.precision)
          const buyStr = fmtNum(contract.buy, contract.precision)
          const highStr = fmtNum(contract.high, contract.precision)
          const lowStr = fmtNum(contract.low, contract.precision)
          return (
            <li
              key={contract.code}
              className="grid grid-cols-[1fr_90px_90px_72px] items-center gap-x-1 px-3 py-3 active:bg-surface-2"
              onClick={() => contract.quoteCode && onSelect(contract.quoteCode)}
            >
              <p className="text-body-strong text-gold-700">{contract.name}</p>

              {/* 卖出 */}
              <p
                className={cn(
                  'text-body-strong tabular text-center',
                  contract.sell != null ? 'text-success' : 'text-subtle-foreground',
                )}
              >
                {sellStr}
              </p>

              {/* 买入 */}
              <p
                className={cn(
                  'text-body-strong tabular text-center',
                  contract.buy != null ? 'text-price' : 'text-subtle-foreground',
                )}
              >
                {buyStr}
              </p>

              {/* 高/低：上下两格 */}
              <div className="text-right tabular">
                <span
                  className={cn(
                    'block text-caption leading-tight',
                    contract.high != null ? 'text-price' : 'text-subtle-foreground',
                  )}
                >
                  {highStr}
                </span>
                <span
                  className={cn(
                    'block text-caption leading-tight',
                    contract.low != null ? 'text-success' : 'text-subtle-foreground',
                  )}
                >
                  {lowStr}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}

// ============ 卡片 1 tab 3：国际现货 ============

function InternationalContractsTable({ onSelect }: { onSelect: (code: string) => void }) {
  return (
    <>
      {/* 表头：商品 | 最高 | 最低 */}
      <div className="grid grid-cols-[1fr_100px_100px] items-center gap-x-2 bg-surface-2 px-3 py-2.5 text-caption text-subtle-foreground">
        <span>商品</span>
        <span className="tabular text-right">最高</span>
        <span className="tabular text-right">最低</span>
      </div>

      {/* 数据行 */}
      <ul className="divide-y divide-border-subtle">
        {INTERNATIONAL_CONTRACTS.map((contract) => (
          <li
            key={contract.code}
            className="grid grid-cols-[1fr_100px_100px] items-center gap-x-2 px-3 py-3 active:bg-surface-2"
            onClick={() => contract.quoteCode && onSelect(contract.quoteCode)}
          >
            <p className="text-body-strong text-gold-700">{contract.name}</p>
            <p className="text-body-strong tabular text-right text-price">
              {contract.high.toFixed(contract.precision)}
            </p>
            <p className="text-body-strong tabular text-right text-success">
              {contract.low.toFixed(contract.precision)}
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}

function OverviewCard({
  quote,
  watched,
  scene,
  onToggleWatch,
  onAlert,
}: {
  quote: Quote
  watched: boolean
  scene: MarketScene | null
  onToggleWatch: () => void
  onAlert: () => void
}) {
  const { price, change, changePct } = quoteChange(quote)
  const positive = change > 0
  const negative = change < 0
  const anomaly = price <= 0 || Math.abs(changePct) > 20
  const changeClass = positive ? 'text-price' : negative ? 'text-success' : 'text-muted-foreground'
  const priceClass = anomaly || scene === 'closed' ? 'text-subtle-foreground' : changeClass
  const sign = positive ? '+' : ''
  const [intPart, decPart] = price.toFixed(quote.precision).split('.')
  const currency = quote.unit === '元/克' ? '¥' : ''

  const stats = [
    { label: '今开', value: quote.open.toFixed(quote.precision), className: 'text-foreground' },
    { label: '最高', value: quote.high.toFixed(quote.precision), className: 'text-price' },
    { label: '最低', value: quote.low.toFixed(quote.precision), className: 'text-success' },
    {
      label: '昨收',
      value: quote.prevClose.toFixed(quote.precision),
      className: 'text-foreground',
    },
    { label: '成交量', value: quote.volume, className: 'text-foreground' },
    { label: '成交额', value: quote.turnover, className: 'text-foreground' },
  ]

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-caption text-subtle-foreground">{quote.name}</span>
            <Badge tone={scene === 'closed' ? 'neutral' : scene === 'offline' ? 'warning' : 'gold'}>
              {scene === 'closed' ? '休市' : scene === 'offline' ? '已断线' : '交易中'}
            </Badge>
          </div>
          <div className={cn('mt-1 flex items-baseline gap-1', priceClass)}>
            {currency ? <span className="text-section">{currency}</span> : null}
            <span className="text-display font-semibold tabular">{intPart}</span>
            <span className="text-caption tabular">.{decPart}</span>
            <span className="ml-1 text-caption text-subtle-foreground">{quote.unit}</span>
          </div>
          {anomaly ? (
            <p className="mt-1 text-caption text-destructive">报价异常，请稍后重试</p>
          ) : (
            <div className={cn('mt-1 flex items-center gap-2 text-caption tabular', changeClass)}>
              <span className="inline-flex items-center gap-0.5">
                {positive ? <TrendingUp size={12} /> : negative ? <TrendingDown size={12} /> : null}
                {sign}
                {change.toFixed(2)}
              </span>
              <span>
                {sign}
                {changePct.toFixed(2)}%
              </span>
              <span className="text-subtle-foreground">较昨收</span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            icon={Star}
            label={watched ? '取消自选' : '加入自选'}
            onClick={onToggleWatch}
            className={watched ? 'text-warning' : 'text-icon-muted'}
          />
          <TextLink onClick={onAlert} tone="primary">
            <Bell size={14} />
            设提醒
          </TextLink>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-3 gap-y-2 border-t border-border-subtle pt-3">
        {stats.map((item) => (
          <div key={item.label}>
            <p className="text-caption text-subtle-foreground">{item.label}</p>
            <p className={cn('mt-0.5 text-body-strong tabular', item.className)}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 text-caption text-subtle-foreground">
        <span className="min-w-0 truncate">{quote.source}</span>
        <span className="inline-flex shrink-0 items-center gap-1 tabular">
          {scene === 'delay' ? <Badge tone="warning">数据延迟</Badge> : null}
          {formatHms(getMarketLastUpdatedAt())}
        </span>
      </div>
    </Card>
  )
}

function ChartCard({ quote }: { quote: Quote }) {
  const [mode, setMode] = useState<ChartMode>('line')
  const [period, setPeriod] = useState<ChartPeriod>('日')
  const price = getLivePrice(quote.code)

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <SegmentedTabs
          items={[
            { value: 'line', label: '分时' },
            { value: 'candle', label: 'K线' },
          ]}
          value={mode}
          onChange={(value) => setMode(value === 'candle' ? 'candle' : 'line')}
          size="sm"
        />
        <span className="text-caption text-subtle-foreground">{quote.unit}</span>
      </div>

      <ChipRow className="gap-1.5">
        {CHART_PERIODS.map((item) => (
          <Chip
            key={item}
            active={item === period}
            onClick={() => setPeriod(item)}
            className="h-7 px-2.5 text-caption"
          >
            {item}
          </Chip>
        ))}
      </ChipRow>

      <PriceChart code={quote.code} period={period} mode={mode} price={price} />

      <p className="text-caption text-subtle-foreground">
        {mode === 'candle'
          ? 'K 线默认展示 MA5 / MA10，数据为演示行情。'
          : '分时图不展示均线，数据为演示行情。'}
      </p>
    </Card>
  )
}

function movingAverage(values: number[], windowSize: number): (number | null)[] {
  return values.map((_, index) => {
    if (index + 1 < windowSize) return null
    const slice = values.slice(index + 1 - windowSize, index + 1)
    return slice.reduce((sum, value) => sum + value, 0) / windowSize
  })
}

function polylinePath(
  values: (number | null)[],
  xOf: (index: number) => number,
  yOf: (value: number) => number,
) {
  let started = false
  let path = ''
  values.forEach((value, index) => {
    if (value == null) {
      started = false
      return
    }
    path += `${started ? 'L' : 'M'}${xOf(index).toFixed(2)} ${yOf(value).toFixed(2)} `
    started = true
  })
  return path.trim()
}

function PriceChart({
  code,
  period,
  mode,
  price,
}: {
  code: string
  period: ChartPeriod
  mode: ChartMode
  price: number
}) {
  const gradientId = useId().replace(/:/g, '')
  const [active, setActive] = useState<number | null>(null)
  const hideRef = useRef<number | null>(null)

  const line = useMemo(
    () => (mode === 'line' ? buildLineSeries(code, period, price) : []),
    [mode, code, period, price],
  )
  const candles = useMemo(
    () => (mode === 'candle' ? buildCandles(code, period, price) : []),
    [mode, code, period, price],
  )

  const count = mode === 'line' ? line.length : candles.length
  const labels =
    mode === 'line' ? line.map((point) => point.label) : candles.map((item) => item.label)
  const values =
    mode === 'line'
      ? line.map((point) => point.price)
      : candles.flatMap((item) => [item.high, item.low])
  const domainMin = Math.min(...values)
  const domainMax = Math.max(...values)
  const span = domainMax - domainMin || 1
  const yOf = (value: number) => 100 - ((value - domainMin) / span) * 100
  const slot = 100 / count
  const xOf = (index: number) => (count <= 1 ? 0 : (index / (count - 1)) * 100)
  const candleX = (index: number) => slot * index + slot / 2

  const linePath = line
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${xOf(index).toFixed(2)} ${yOf(point.price).toFixed(2)}`,
    )
    .join(' ')
  const areaPath = line.length > 0 ? `${linePath} L100 100 L0 100 Z` : ''
  const ma5Path = polylinePath(
    movingAverage(
      candles.map((item) => item.close),
      5,
    ),
    candleX,
    yOf,
  )
  const ma10Path = polylinePath(
    movingAverage(
      candles.map((item) => item.close),
      10,
    ),
    candleX,
    yOf,
  )

  const activeIndex = active != null && active < count ? active : null
  const activeX =
    activeIndex == null ? 0 : mode === 'line' ? xOf(activeIndex) : candleX(activeIndex)

  const clearHide = () => {
    if (hideRef.current !== null) {
      window.clearTimeout(hideRef.current)
      hideRef.current = null
    }
  }

  const scheduleHide = () => {
    clearHide()
    hideRef.current = window.setTimeout(() => setActive(null), 2000)
  }

  const handlePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (count === 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width === 0) return
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    setActive(Math.min(count - 1, Math.max(0, Math.round(ratio * (count - 1)))))
  }

  useEffect(
    () => () => {
      if (hideRef.current !== null) window.clearTimeout(hideRef.current)
    },
    [],
  )

  useEffect(() => {
    setActive(null)
  }, [mode, period, code])

  return (
    <div>
      <div className="flex items-center justify-between text-caption text-subtle-foreground tabular">
        <span>最高 {domainMax.toFixed(2)}</span>
        <span>最低 {domainMin.toFixed(2)}</span>
      </div>

      <div
        className="relative mt-1 h-44 w-full touch-none select-none"
        onPointerDown={(event) => {
          clearHide()
          handlePointer(event)
        }}
        onPointerMove={(event) => {
          if (event.buttons !== 0) handlePointer(event)
        }}
        onPointerUp={scheduleHide}
        onPointerLeave={scheduleHide}
        onPointerCancel={scheduleHide}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <line
            x1="0"
            y1="25"
            x2="100"
            y2="25"
            strokeDasharray="2 3"
            vectorEffect="non-scaling-stroke"
            className="stroke-border-subtle"
          />
          <line
            x1="0"
            y1="75"
            x2="100"
            y2="75"
            strokeDasharray="2 3"
            vectorEffect="non-scaling-stroke"
            className="stroke-border-subtle"
          />

          {mode === 'line' ? (
            <g className="text-gold-600">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
              <path
                d={linePath}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ) : (
            <g>
              {candles.map((item, index) => {
                const up = item.close >= item.open
                const x = candleX(index)
                const bodyTop = yOf(Math.max(item.open, item.close))
                const bodyBottom = yOf(Math.min(item.open, item.close))
                return (
                  <g
                    key={index}
                    className={up ? 'text-price' : 'text-success'}
                    fill="currentColor"
                    stroke="currentColor"
                  >
                    <line
                      x1={x}
                      y1={yOf(item.high)}
                      x2={x}
                      y2={yOf(item.low)}
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                    <rect
                      x={x - slot * 0.28}
                      y={bodyTop}
                      width={slot * 0.56}
                      height={Math.max(0.6, bodyBottom - bodyTop)}
                    />
                  </g>
                )
              })}
              <path
                d={ma5Path}
                fill="none"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                className="text-gold-600"
                stroke="currentColor"
              />
              <path
                d={ma10Path}
                fill="none"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                className="text-info"
                stroke="currentColor"
              />
            </g>
          )}

          {activeIndex != null ? (
            <line
              x1={activeX}
              y1="0"
              x2={activeX}
              y2="100"
              strokeDasharray="2 2"
              vectorEffect="non-scaling-stroke"
              className="text-icon-muted"
              stroke="currentColor"
            />
          ) : null}
        </svg>

        {activeIndex != null ? (
          <div className="pointer-events-none absolute left-2 top-2 rounded-sm bg-card px-2 py-1 text-caption shadow-xs ring-1 ring-border-subtle">
            <div className="tabular text-subtle-foreground">{labels[activeIndex]}</div>
            {mode === 'line' ? (
              <div className="tabular text-foreground">{line[activeIndex].price.toFixed(2)}</div>
            ) : (
              <div className="tabular text-foreground">
                开 {candles[activeIndex].open.toFixed(2)} 收 {candles[activeIndex].close.toFixed(2)}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-1 flex justify-between text-caption text-subtle-foreground tabular">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  )
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

function TradeCard({
  scene,
  marketOpen,
  onBuy,
  onSell,
}: {
  scene: MarketScene | null
  marketOpen: boolean
  onBuy: (grams: number) => void
  onSell: (grams: number) => void
}) {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy')
  const [grams, setGrams] = useState(DEFAULT_TRADE_GRAMS)
  const buyPrice = getLivePrice('platform-buy')
  const recyclePrice = getLivePrice('platform-recycle')
  const buyTotal = round2(grams * buyPrice)
  const sellTotal = round2(grams * recyclePrice)
  const priceOptions = [
    { value: 'buy' as const, priceLabel: '买入价', label: '我要买', price: buyPrice },
    { value: 'sell' as const, priceLabel: '回购价', label: '我要卖', price: recyclePrice },
  ]
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
      <p className="text-card-title text-foreground">平台金条报价与交易</p>

      {/* P0+P1 重写：统一选中态配色 / radio→pressed / 间距节奏 / 单位弱化 / 箭头替代圆点 / 语义色统一 */}
      <div
        role="radiogroup"
        aria-label="交易方向"
        className="divide-y divide-border-subtle overflow-hidden rounded-md ring-1 ring-border-subtle"
      >
        {priceOptions.map((option) => {
          const active = mode === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => setMode(option.value)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-3 text-left transition',
                active ? 'bg-primary-soft/40' : 'bg-card active:bg-surface-2',
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                {/* 价格主体：标签caption + 金额强调 + 单位弱化，单位比标签更弱 */}
                <span className="shrink-0 text-caption text-subtle-foreground">
                  {option.priceLabel}：
                </span>
                <span className="text-body-strong tabular text-foreground">
                  ¥{option.price.toFixed(2)}
                </span>
                <span className="shrink-0 text-caption text-muted-foreground">元/克</span>
                {/* 方向文字紧跟价格组，间距统一 */}
                <span
                  className={cn(
                    'shrink-0 text-body',
                    active ? 'text-foreground font-medium' : 'text-muted-foreground',
                  )}
                >
                  {option.label}
                </span>
              </span>
              {/* 右对齐箭头，替代圆点（圆点暗示独立控件，箭头只做选中锚点） */}
              <span
                aria-hidden="true"
                className={cn(
                  'ml-auto flex shrink-0 items-center text-lg leading-none transition',
                  active ? 'text-primary' : 'text-border',
                )}
              >
                ›
              </span>
            </button>
          )
        })}
      </div>

      <div>
        <p className="text-caption text-subtle-foreground">
          {mode === 'buy' ? '规格（克）' : '卖出克重（克）'}
        </p>
        <ChipRow className="mt-1.5">
          {TRADE_SPECS.map((spec) => (
            <Chip key={spec} active={spec === grams} onClick={() => setGrams(spec)}>
              {spec}g
            </Chip>
          ))}
        </ChipRow>
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-border-subtle pt-2.5">
        <span className="text-caption text-subtle-foreground">
          {mode === 'buy' ? `合计 · ${grams}g` : '预计到账'}
        </span>
        <p className="text-body-strong tabular text-foreground">
          ¥{(mode === 'buy' ? buyTotal : sellTotal).toFixed(2)}
        </p>
      </div>

      {mode === 'sell' ? (
        <p className="-mt-1.5 text-caption text-subtle-foreground">
          预计到账按当前回购价估算，最终以检测克重与确认时报价为准。
        </p>
      ) : null}

      {locked ? <p className="text-caption text-warning">{reason}</p> : null}

      <Button
        variant="primary"
        size="md"
        block
        disabled={locked}
        onClick={() => (mode === 'buy' ? onBuy(grams) : onSell(grams))}
      >
        {locked
          ? mode === 'buy'
            ? '暂不可买入'
            : '暂不可卖出'
          : mode === 'buy'
            ? '立即买入'
            : '立即卖金'}
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
