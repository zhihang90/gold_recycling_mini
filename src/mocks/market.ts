import { round2 } from '@/lib/money'

/** 本地演示态存储键：与需求文档 6.4 保持一致 */
export const MARKET_STORAGE = {
  watchlist: 'gold_market_watchlist',
  alerts: 'gold_market_alerts',
  riskAck: 'gold_market_risk_ack',
  alertSettings: 'gold_market_alert_settings',
  subscription: 'gold_price_subscription',
} as const

// ============ 行情标的 ============

export type QuoteGroup = '平台' | '上金所' | '国际'

export interface Quote {
  code: string
  name: string
  group: QuoteGroup
  unit: string
  precision: number
  /** 初始价：页面上的实时价在运行时围绕它小幅波动 */
  basePrice: number
  open: number
  high: number
  low: number
  prevClose: number
  volume: string
  turnover: string
  source: string
  /** 提醒金价：销售价（面向消费者）；为空时 fallback 到 basePrice + spread */
  salePrice?: number
  /** 提醒金价：回购价（面向回收端）；为空时 fallback 到 basePrice - spread */
  buybackPrice?: number
}

/** 首版标的清单：平台 / 上金所 / 国际三组，默认展示平台金条买入价 */
export const MARKET_QUOTES: Quote[] = [
  {
    code: 'platform-buy',
    name: '平台金条买入价',
    group: '平台',
    unit: '元/克',
    precision: 2,
    basePrice: 668.2,
    open: 665.1,
    high: 669.6,
    low: 664.2,
    prevClose: 664.4,
    volume: '2.31万',
    turnover: '15.4亿',
    source: '上海黄金交易所',
  },
  {
    code: 'platform-recycle',
    name: '平台金条回购价',
    group: '平台',
    unit: '元/克',
    precision: 2,
    basePrice: 655.8,
    open: 652.6,
    high: 657.1,
    low: 651.8,
    prevClose: 652.1,
    volume: '1.86万',
    turnover: '12.2亿',
    source: '上海黄金交易所',
    salePrice: 778.07,
    buybackPrice: 774.69,
  },
  {
    code: 'silver',
    name: '白银',
    group: '平台',
    unit: '元/克',
    precision: 3,
    basePrice: 9.524,
    open: 9.451,
    high: 9.679,
    low: 9.339,
    prevClose: 9.451,
    volume: '—',
    turnover: '—',
    source: '上海黄金交易所',
    salePrice: 9.624,
    buybackPrice: 9.524,
  },
  {
    code: 'platinum',
    name: '铂金',
    group: '平台',
    unit: '元/克',
    precision: 2,
    basePrice: 280.7,
    open: 278.9,
    high: 284.9,
    low: 278.9,
    prevClose: 278.9,
    volume: '—',
    turnover: '—',
    source: '上海黄金交易所',
    salePrice: 282.2,
    buybackPrice: 280.7,
  },
  {
    code: 'kgold',
    name: 'K金',
    group: '平台',
    unit: '元/克',
    precision: 2,
    basePrice: 512.4,
    open: 508.1,
    high: 515.6,
    low: 506.2,
    prevClose: 508.1,
    volume: '—',
    turnover: '—',
    source: '上海黄金交易所',
    salePrice: 515.0,
    buybackPrice: 511.0,
  },
  {
    code: 'au9999',
    name: 'Au99.99',
    group: '上金所',
    unit: '元/克',
    precision: 2,
    basePrice: 667.9,
    open: 664.9,
    high: 669.2,
    low: 663.8,
    prevClose: 664.1,
    volume: '18.6吨',
    turnover: '124.3亿',
    source: '上海黄金交易所',
  },
  {
    code: 'au100g',
    name: 'Au100g',
    group: '上金所',
    unit: '元/克',
    precision: 2,
    basePrice: 668.3,
    open: 665.4,
    high: 669.8,
    low: 664.6,
    prevClose: 664.7,
    volume: '3,240手',
    turnover: '21.6亿',
    source: '上海黄金交易所',
  },
  {
    code: 'xau',
    name: '伦敦金 XAU/USD',
    group: '国际',
    unit: '美元/盎司',
    precision: 2,
    basePrice: 4035.2,
    open: 4012.6,
    high: 4048.9,
    low: 4005.3,
    prevClose: 4010.5,
    volume: '—',
    turnover: '—',
    source: '伦敦金银市场协会',
  },
  {
    code: 'dxy',
    name: '美元指数',
    group: '国际',
    unit: '点',
    precision: 2,
    basePrice: 99.42,
    open: 99.65,
    high: 99.71,
    low: 99.28,
    prevClose: 99.63,
    volume: '—',
    turnover: '—',
    source: '洲际交易所',
  },
]

export const DEFAULT_QUOTE_CODE = 'platform-buy'
export const QUOTE_GROUP_ORDER: QuoteGroup[] = ['平台', '上金所', '国际']

// ============ 卡片 1 Pill Tab（实物价格 / 上金所行情 / 国际现货） ============

/**
 * 卡片 1 三个 tab 全走表格视图。
 * - physical → 公司贵金属实物挂牌（回购/销售/高低）
 * - domestic → 上金所合约行情（最新价/涨跌/涨跌幅）
 * - international → 国际贵金属现货行情
 * 这三 tab 本身不对应单个 Quote 对象（表格里每行是一个品种），
 * 图表与交易卡片固定独立展示 Au99.99 的行情（卡片 2 不动）。
 */
export type QuoteTab = 'physical' | 'domestic' | 'international'

export interface QuoteTabMeta {
  value: QuoteTab
  label: string
}

export const QUOTE_TABS: QuoteTabMeta[] = [
  { value: 'physical', label: '实时金价' },
  { value: 'domestic', label: '上金所行情' },
  { value: 'international', label: '国际现货' },
]

export const DEFAULT_QUOTE_TAB: QuoteTab = 'physical'

// ============ 上金所行情（卡片 1 tab 2） ============

export interface DomesticContract {
  /** 合约代码 */
  code: string
  /** 商品名称 */
  name: string
  /** 卖出价；空表示暂无 */
  sell: number | null
  /** 买入价；空表示暂无 */
  buy: number | null
  /** 当日最高价；空表示暂无 */
  high: number | null
  /** 当日最低价；空表示暂无 */
  low: number | null
  /** 关联 MARKET_QUOTES.code；可点击跳到详情，缺省时不可点 */
  quoteCode?: string
  /** 小数位（1/2/3） */
  precision: number
}

/** 上金所合约行情：黄金9999 / 白银T+D / 铂金9995 / 黄金T+D */
export const DOMESTIC_CONTRACTS: DomesticContract[] = [
  {
    code: 'Au99.99',
    name: '黄金9999',
    sell: 780.5,
    buy: 781.4,
    high: 783.0,
    low: 755.01,
    precision: 2,
  },
  {
    code: 'Ag(T+D)',
    name: '白银T+D',
    sell: 10148.0,
    buy: 10155.0,
    high: 10178.0,
    low: 9637.0,
    precision: 1,
  },
  {
    code: 'Pt99.95',
    name: '铂金9995',
    sell: null,
    buy: 328.35,
    high: 327.29,
    low: 323.51,
    precision: 2,
  },
  {
    code: 'Au(T+D)',
    name: '黄金T+D',
    sell: 779.2,
    buy: 781.0,
    high: 781.3,
    low: 756.0,
    precision: 1,
  },
]

// ============ 国际现货（卡片 1 tab 3） ============

export interface InternationalContract {
  code: string
  name: string
  /** 最高价 */
  high: number
  /** 最低价 */
  low: number
  quoteCode?: string
  /** 小数位 */
  precision: number
  /** 单位描述（不展示，仅用于 tooltip） */
  unitLabel: string
}

/** 国际现货行情：港金 / 伦敦金 / 伦敦银 / 美元指数 / 美元汇率 */
export const INTERNATIONAL_CONTRACTS: InternationalContract[] = [
  { code: 'HKGOLD', name: '港金', high: 33759, low: 33756, precision: 0, unitLabel: '港币/两' },
  {
    code: 'XAU',
    name: '伦敦金',
    high: 3622.7,
    low: 3622,
    precision: 1,
    unitLabel: '美元/盎司',
    quoteCode: 'xau',
  },
  { code: 'XAG', name: '伦敦银', high: 42.65, low: 42.61, precision: 2, unitLabel: '美元/盎司' },
  { code: 'DXY', name: '美元指数', high: 103.62, low: 103.62, precision: 2, unitLabel: '指数' },
  {
    code: 'USDCNH',
    name: '美元汇率',
    high: 6.6662,
    low: 6.6662,
    precision: 4,
    unitLabel: '人民币/美元',
  },
]

// ============ 实物行情（公司贵金属回购/销售挂牌价） ============

export interface PhysicalMetal {
  /** 商品中文名 */
  name: string
  /** 单位（元/克 / 元/盎司） */
  unit: string
  /** 小数位 */
  precision: number
  /** 回购价；空表示暂无 */
  buyback: number | null
  /** 销售价；空表示暂无 */
  sale: number | null
  /** 当日最高价 */
  high: number | null
  /** 当日最低价 */
  low: number | null
}

/**
 * 公司内部贵金属实物行情挂牌（含回购价与销售价）
 * 数据为演示值，涨跌颜色由前端根据 high vs low 对比当前价决定
 */
export const PHYSICAL_METALS: PhysicalMetal[] = [
  {
    name: '黄金',
    unit: '元/克',
    precision: 2,
    buyback: 775.8,
    sale: 778.8,
    high: 784.0,
    low: 761.51,
  },
  {
    name: '白银',
    unit: '元/克',
    precision: 3,
    buyback: 9.524,
    sale: 9.624,
    high: 9.679,
    low: 9.339,
  },
  {
    name: '铂金',
    unit: '元/克',
    precision: 2,
    buyback: 280.7,
    sale: 282.2,
    high: 284.9,
    low: 278.9,
  },
  {
    name: '钯金',
    unit: '元/克',
    precision: 2,
    buyback: 193.6,
    sale: 195.1,
    high: 196.8,
    low: 192.2,
  },
]

/** 投资金条报价：黄金实物 = 国内实时金价 + 加价，按克重档位收不同工费 */
export const RETAIL_GOLD = {
  brand: '安盛华',
  /** 实物金价在国内实时金价基础上的加价（元/克） */
  premium: 41,
}

/** 投资金条克重档位与对应工费（元/克），销售价 =（实物金价 + 工费）× 克重 */
export const BAR_PRICE_TIERS = [
  { grams: 1, fee: 41 },
  { grams: 2, fee: 25 },
  { grams: 5, fee: 19 },
  { grams: 10, fee: 13 },
  { grams: 20, fee: 12 },
  { grams: 30, fee: 12 },
  { grams: 50, fee: 11 },
  { grams: 100, fee: 11 },
  { grams: 200, fee: 11 },
  { grams: 500, fee: 10.5 },
  { grams: 1000, fee: 8 },
] as const

/** 金价走势卡展开面板的时间档位 */
export const TREND_RANGES = ['分时', '近1月', '近3月', '近6月', '近1年'] as const
export type TrendRange = (typeof TREND_RANGES)[number]

const TREND_SPAN_DAYS: Record<TrendRange, number> = {
  分时: 0,
  近1月: 30,
  近3月: 90,
  近6月: 180,
  近1年: 365,
}

function trendLabel(index: number, count: number, range: TrendRange) {
  const days = TREND_SPAN_DAYS[range]
  if (days === 0) {
    const total = 9 * 60 + 30 + Math.round((index / Math.max(1, count - 1)) * 390)
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }
  const base = new Date(2026, 10, 25)
  const date = new Date(
    base.getTime() - ((count - 1 - index) / Math.max(1, count - 1)) * days * 864e5,
  )
  return `${date.getMonth() + 1}-${String(date.getDate()).padStart(2, '0')}`
}

/** 走势面板折线：末点对齐当前价，周期越长波动越大 */
export function buildTrendSeries(
  code: string,
  range: TrendRange,
  price: number,
  count = 40,
): ChartPoint[] {
  const rng = makeRng(seedOf(`${code}:${range}:trend`))
  const volatility =
    range === '分时'
      ? 0.0026
      : range === '近1月'
        ? 0.009
        : range === '近3月'
          ? 0.016
          : range === '近6月'
            ? 0.022
            : 0.03
  const values: number[] = []
  let value = price * (1 - volatility * 0.8 - rng() * volatility)
  for (let index = 0; index < count; index += 1) {
    value += (rng() - 0.47) * price * volatility
    values.push(value)
  }
  const delta = price - values[count - 1]
  return values.map((item, index) => ({
    label: trendLabel(index, count, range),
    price: round2(item + delta * (index / (count - 1))),
  }))
}

/** 金价走势面板的词条解释 */
export const QUOTE_GLOSSARY: Record<string, string> = {
  au9999: 'Au9999又名万足金，是含金量为99.99%的黄金，国内最主要的金价参考值。',
  xau: '伦敦金（XAU/USD）是以美元/盎司计价的国际现货黄金，反映全球黄金市场的即时价格。',
}

/** 实物行情声明与免责 */
export const PHYSICAL_QUOTE_DISCLAIMER = [
  '声明：以上商品报价仅供参考！',
  '免责声明：相关价格仅适用于我司自身贵金属实物销售及回收业务，其他主体参考该价格开展非黄金活动的，与我司无关，我司概不负责。我司一旦发现有关违法违规线索，将向有关机关（包括公安部门）报告。',
]

export function quoteByCode(code: string): Quote | undefined {
  return MARKET_QUOTES.find((quote) => quote.code === code)
}

export function quoteName(code: string): string {
  return quoteByCode(code)?.name ?? code
}

// ============ 运行时价格（3 秒模拟刷新） ============

interface MarketRuntime {
  prices: Record<string, number>
  lastUpdatedAt: number
}

let runtime: MarketRuntime | null = null

function ensureRuntime(): MarketRuntime {
  if (!runtime) {
    runtime = {
      prices: Object.fromEntries(MARKET_QUOTES.map((quote) => [quote.code, quote.basePrice])),
      lastUpdatedAt: Date.now(),
    }
  }
  return runtime
}

export function getLivePrice(code: string): number {
  return ensureRuntime().prices[code] ?? 0
}

export function getMarketLastUpdatedAt(): number {
  return ensureRuntime().lastUpdatedAt
}

/** 行情变化：现价 − 昨收，涨跌幅按昨收计算并保留 2 位 */
export function quoteChange(quote: Quote) {
  const price = getLivePrice(quote.code)
  const change = round2(price - quote.prevClose)
  const changePct = quote.prevClose ? round2((change / quote.prevClose) * 100) : 0
  return { price, change, changePct }
}

/** 模拟一次报价刷新：小幅随机波动，并检查到价提醒是否命中 */
export function simulateMarketTick() {
  const state = ensureRuntime()
  for (const quote of MARKET_QUOTES) {
    const current = state.prices[quote.code] ?? quote.basePrice
    const drift = (Math.random() - 0.47) * quote.basePrice * 0.0016
    const min = quote.basePrice * 0.96
    const max = quote.basePrice * 1.04
    state.prices[quote.code] = round2(Math.min(max, Math.max(min, current + drift)))
  }
  state.lastUpdatedAt = Date.now()
  evaluateAlerts(state.prices)
}

// ============ 本地存储 ============

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 隐私模式下本地存储不可用时降级为内存态
  }
}

// ---- 自选 ----

export const WATCH_LIMIT = 8

export function readWatchlist(): string[] {
  const list = readJson<string[]>(MARKET_STORAGE.watchlist, [])
  if (!Array.isArray(list)) return []
  return list.filter((code) => quoteByCode(code) !== undefined).slice(0, WATCH_LIMIT)
}

export function addWatch(code: string): 'ok' | 'limit' {
  const list = readWatchlist()
  if (list.includes(code)) return 'ok'
  if (list.length >= WATCH_LIMIT) return 'limit'
  writeJson(MARKET_STORAGE.watchlist, [...list, code])
  return 'ok'
}

export function removeWatch(code: string) {
  writeJson(
    MARKET_STORAGE.watchlist,
    readWatchlist().filter((item) => item !== code),
  )
}

export function clearWatchlist() {
  writeJson(MARKET_STORAGE.watchlist, [])
}

// ---- 金价订阅提醒 ----

export interface PriceSubscription {
  enabled: boolean
  /** 目标金价（元/克） */
  targetPrice: number
  /** 订阅标的，固定 Au99.99 */
  productCode: string
  updatedAt: number
}

export const SUBSCRIBE_FLUCTUATION_HELP =
  '金价在短时间内出现明显涨跌时提醒你，每个交易日最多 3 次。'
export const SUBSCRIBE_NOTE = '开启提醒后，将通过服务通知发送消息'

/** 目标价快捷档：当前价向下取整到 50，给出偏低 / 接近 / 偏高 三档 */
export function targetPricePresets(price: number): number[] {
  const base = Math.max(50, Math.floor(price / 50) * 50)
  return [base - 50, base, base + 50]
}

export function defaultTargetPrice(price: number) {
  return targetPricePresets(price)[1]
}

export function readPriceSubscription(): PriceSubscription | null {
  const data = readJson<Partial<PriceSubscription> | null>(MARKET_STORAGE.subscription, null)
  if (!data || data.enabled !== true || typeof data.targetPrice !== 'number') return null
  return {
    enabled: true,
    targetPrice: data.targetPrice,
    productCode: data.productCode ?? 'au9999',
    updatedAt: data.updatedAt ?? Date.now(),
  }
}

export function writePriceSubscription(input: {
  targetPrice: number
  productCode: string
}): PriceSubscription {
  const record: PriceSubscription = {
    enabled: true,
    targetPrice: input.targetPrice,
    productCode: input.productCode,
    updatedAt: Date.now(),
  }
  writeJson(MARKET_STORAGE.subscription, record)
  return record
}

export function clearPriceSubscription() {
  try {
    window.localStorage.removeItem(MARKET_STORAGE.subscription)
  } catch {
    // 同存储降级
  }
}

// ---- 到价提醒 ----

export type AlertDirection = 'above' | 'below'
export type AlertStatus = 'pending' | 'triggered'

export interface PriceAlert {
  id: string
  code: string
  direction: AlertDirection
  target: number
  createdAt: number
  status: AlertStatus
  triggeredAt?: number
}

export const ALERT_LIMIT = 3
/** 已触发提醒保留 7 天展示 */
const ALERT_TTL = 7 * 24 * 60 * 60 * 1000

export const ALERT_DIRECTION_LABEL: Record<AlertDirection, string> = {
  above: '高于',
  below: '低于',
}

export function readAlerts(): PriceAlert[] {
  const list = readJson<PriceAlert[]>(MARKET_STORAGE.alerts, [])
  if (!Array.isArray(list)) return []
  const now = Date.now()
  return list.filter((alert) => {
    if (!alert || typeof alert.code !== 'string') return false
    if (alert.status === 'pending') return true
    return Boolean(alert.triggeredAt && now - alert.triggeredAt < ALERT_TTL)
  })
}

function writeAlerts(list: PriceAlert[]) {
  writeJson(MARKET_STORAGE.alerts, list)
}

export function pendingAlertsOf(code: string): PriceAlert[] {
  return readAlerts().filter((alert) => alert.status === 'pending' && alert.code === code)
}

export function addAlert(input: {
  code: string
  direction: AlertDirection
  target: number
}): { ok: true } | { ok: false; reason: 'limit' | 'duplicate' } {
  const list = readAlerts()
  // 同一标的最多同时存在 3 条待触发提醒
  const pending = list.filter((alert) => alert.status === 'pending' && alert.code === input.code)
  if (pending.length >= ALERT_LIMIT) return { ok: false, reason: 'limit' }
  const duplicated = pending.some((alert) => alert.target === round2(input.target))
  if (duplicated) return { ok: false, reason: 'duplicate' }

  const alert: PriceAlert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    code: input.code,
    direction: input.direction,
    target: round2(input.target),
    createdAt: Date.now(),
    status: 'pending',
  }
  writeAlerts([...list, alert])
  return { ok: true }
}

export function removeAlert(id: string) {
  writeAlerts(readAlerts().filter((alert) => alert.id !== id))
}

/** 命中目标价后把提醒置为已触发；只在本地记录，不调用系统推送 */
function evaluateAlerts(prices: Record<string, number>) {
  const list = readAlerts()
  const now = Date.now()
  let changed = false
  const next = list.map((alert) => {
    if (alert.status !== 'pending') return alert
    const price = prices[alert.code]
    if (price == null) return alert
    const hit = alert.direction === 'above' ? price >= alert.target : price <= alert.target
    if (!hit) return alert
    changed = true
    return { ...alert, status: 'triggered' as const, triggeredAt: now }
  })
  if (changed) writeAlerts(next)
}

// ---- 每日价格提醒设置（全屏「设置提醒」页） ----

export interface AlertSettings {
  /** 每日价格提醒开关 */
  enabled: boolean
  /** 选中的商品 code：platform-recycle / silver / platinum / kgold */
  productCode: string
  /** 提醒金价模式：销售价（面向消费者）/ 回购价（面向回收端） */
  priceMode: 'sale' | 'buyback'
  /** 推送时机（预设值，逗号分隔，如 "09:00,15:00,20:00"） */
  pushTime: string
  /** 推送间隔（触发后再次推送的冷却） */
  pushInterval: string
  /** 价格波动触发阈值（元/克） */
  priceChange: string
  /** 勿扰时段；null 表示未设置 */
  doNotDisturb: { start: string; end: string } | null
  /** 开启后自动删除已触发提醒（「我的提醒」tab 的开关） */
  autoDeleteTriggered: boolean
}

/** 商品 Tab 预设（设置提醒页顶部） */
export const ALERT_PRODUCT_TABS: { code: string; label: string }[] = [
  { code: 'platform-recycle', label: '黄金' },
  { code: 'silver', label: '白银' },
  { code: 'platinum', label: '铂金' },
  { code: 'kgold', label: 'K金' },
]

/** 推送时机预设（PickerSheet 4 选 1） */
export const PUSH_TIME_PRESETS: { value: string; label: string }[] = [
  { value: '09:00,15:00,20:00', label: '09:00,15:00,20:00' },
  { value: '09:00,12:00,18:00', label: '09:00,12:00,18:00' },
  { value: '08:00,14:00,20:00', label: '08:00,14:00,20:00' },
  { value: '10:00,15:00,21:00', label: '10:00,15:00,21:00' },
]

/** 推送间隔选项 */
export const PUSH_INTERVAL_OPTIONS: { value: string; label: string }[] = [
  { value: '0', label: '不限制' },
  { value: '1h', label: '1 小时' },
  { value: '2h', label: '2 小时' },
  { value: '4h', label: '4 小时' },
  { value: '8h', label: '8 小时' },
  { value: '12h', label: '12 小时' },
]

/** 价格波动阈值（元/克，图 2 为金额而非百分比） */
export const PRICE_CHANGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: '不推送' },
  { value: '0.5', label: '0.5 元' },
  { value: '1', label: '1 元' },
  { value: '2', label: '2 元' },
  { value: '3', label: '3 元' },
]

/** 推送间隔说明（图 2 ? 弹窗） */
export const PUSH_INTERVAL_HELP =
  '为避免价格长达达标时被频繁打扰，金价类通知（达标提醒、每日播报、金价波动提醒）共用一个冷却窗口：同一窗口内最多推送一次。可选 1/2/4/6/8/12 小时，默认不推送波动提醒（选「不推送」即关闭金价波动提醒，不影响达标提醒与每日播报）。'

/** 价格波动说明（图 3 ? 弹窗） */
export const PRICE_CHANGE_HELP =
  '当日金价较前一收盘涨跌超过该金额（元/克）时，推送「金价波动提醒」。可选 0.5 元 / 1 元 / 2 元 / 3 元，默认不推送（选「不推送」即关闭金价波动提醒）。金额设得越小提醒越频繁，仍受推送间隔与勿扰时段约束。'

export const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  enabled: false,
  productCode: 'platform-recycle',
  priceMode: 'sale',
  pushTime: '09:00,15:00,20:00',
  pushInterval: '2h',
  priceChange: 'none',
  doNotDisturb: null,
  autoDeleteTriggered: false,
}

export function readAlertSettings(): AlertSettings {
  const data = readJson<Partial<AlertSettings>>(MARKET_STORAGE.alertSettings, {})
  return { ...DEFAULT_ALERT_SETTINGS, ...data }
}

export function writeAlertSettings(settings: AlertSettings) {
  writeJson(MARKET_STORAGE.alertSettings, settings)
}

// ---- 风险提示已读 ----

export function readRiskAck(): boolean {
  try {
    return window.localStorage.getItem(MARKET_STORAGE.riskAck) === '1'
  } catch {
    return false
  }
}

export function writeRiskAck() {
  try {
    window.localStorage.setItem(MARKET_STORAGE.riskAck, '1')
  } catch {
    // 同存储降级
  }
}

// ============ 关联产品 ============

export interface RelatedProduct {
  key: string
  name: string
  price: number
  changePct: number
  unit: string
  precision: number
}

/** 按「国际 → 贵金属」排序，作为金价判断的参照物 */
export const RELATED_PRODUCTS: RelatedProduct[] = [
  { key: 'xau', name: '伦敦金', price: 4035.2, changePct: 0.62, unit: '美元/盎司', precision: 2 },
  { key: 'xag', name: '伦敦银', price: 48.26, changePct: 1.14, unit: '美元/盎司', precision: 2 },
  { key: 'dxy', name: '美元指数', price: 99.42, changePct: -0.21, unit: '点', precision: 2 },
  { key: 'oil', name: '原油', price: 71.35, changePct: 0.48, unit: '美元/桶', precision: 2 },
  { key: 'ag', name: '白银', price: 8.62, changePct: 0.97, unit: '元/克', precision: 2 },
  { key: 'pt', name: '铂金', price: 312.4, changePct: -0.35, unit: '元/克', precision: 2 },
]

export interface FxRate {
  key: string
  name: string
  value: number
}

export const FX_RATES: FxRate[] = [
  { key: 'usd', name: '人民币/美元', value: 7.1042 },
  { key: 'hkd', name: '人民币/港币', value: 0.9128 },
  { key: 'eur', name: '人民币/欧元', value: 7.6821 },
  { key: 'gbp', name: '人民币/英镑', value: 8.9543 },
]

// ============ 图表数据 ============

export const CHART_PERIODS = ['1分', '5分', '15分', '1小时', '日', '周', '月'] as const
export type ChartPeriod = (typeof CHART_PERIODS)[number]

export interface ChartPoint {
  label: string
  price: number
}

export interface Candle {
  label: string
  open: number
  high: number
  low: number
  close: number
}

const PERIOD_MINUTES: Record<ChartPeriod, number> = {
  '1分': 1,
  '5分': 5,
  '15分': 15,
  '1小时': 60,
  日: 1440,
  周: 10080,
  月: 43200,
}

function seedOf(text: string) {
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function makeRng(seed: number) {
  let state = seed || 1
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

/** 横轴标签：日内用时间，日/周/月用日期，固定基准避免每次渲染跳动 */
function chartLabel(index: number, count: number, period: ChartPeriod) {
  const step = PERIOD_MINUTES[period]
  if (step >= 1440) {
    const date = new Date(2026, 10, 23)
    date.setDate(date.getDate() - (count - 1 - index) * Math.round(step / 1440))
    return `${date.getMonth() + 1}-${String(date.getDate()).padStart(2, '0')}`
  }
  const total = 9 * 60 + 30 + index * step
  const hour = Math.floor((total % (24 * 60)) / 60)
  const minute = total % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/** 分时线：末点对齐当前价，保证图表与概览价格一致 */
export function buildLineSeries(
  code: string,
  period: ChartPeriod,
  price: number,
  count = 48,
): ChartPoint[] {
  const rng = makeRng(seedOf(`${code}:${period}:line`))
  const values: number[] = []
  let value = price * (1 - 0.012 - rng() * 0.008)
  for (let index = 0; index < count; index += 1) {
    value += (rng() - 0.46) * price * 0.0026
    values.push(value)
  }
  const delta = price - values[count - 1]
  return values.map((item, index) => ({
    label: chartLabel(index, count, period),
    price: round2(item + delta * (index / (count - 1))),
  }))
}

/** K 线：末根收盘对齐当前价 */
export function buildCandles(
  code: string,
  period: ChartPeriod,
  price: number,
  count = 36,
): Candle[] {
  const rng = makeRng(seedOf(`${code}:${period}:candle`))
  const result: Candle[] = []
  let prevClose = price * (1 - 0.03)
  for (let index = 0; index < count; index += 1) {
    const open = prevClose
    const close = open + (rng() - 0.46) * price * 0.007
    const high = Math.max(open, close) + rng() * price * 0.002
    const low = Math.min(open, close) - rng() * price * 0.002
    result.push({ label: chartLabel(index, count, period), open, high, low, close })
    prevClose = close
  }
  const delta = price - result[count - 1].close
  return result.map((candle, index) => {
    const shift = delta * (index / (count - 1))
    return {
      label: candle.label,
      open: round2(candle.open + shift),
      high: round2(candle.high + shift),
      low: round2(candle.low + shift),
      close: round2(candle.close + shift),
    }
  })
}

// ============ 快捷交易 ============

export const TRADE_SPECS = [5, 10, 20, 50, 100]
export const DEFAULT_TRADE_GRAMS = 10
/** 占位费率：实际以平台规则为准 */
export const TRADE_FEE_RATE = 0.002

export function tradeAmount(grams: number, price: number) {
  const subtotal = round2(grams * price)
  const fee = round2(subtotal * TRADE_FEE_RATE)
  return { subtotal, fee, total: round2(subtotal + fee) }
}

// ============ 资讯 ============

export interface NewsArticle {
  id: string
  title: string
  publishedAt: string
  source: string
  paragraphs: string[]
}

export const MARKET_NEWS: NewsArticle[] = [
  {
    id: 'n-20261122183451130800',
    title: '深交所组合式推出新一批降费措施 助力激发市场主体活力',
    publishedAt: '2026-11-22 18:34',
    source: '金十数据',
    paragraphs: [
      '金十数据11月22日讯，11月22日，深交所发布《关于进一步减免相关费用的通知》，推出新一批降费措施，包括免收交易单元使用费、网络投票服务费、减免交易通信服务费、下调数据中心收费标准等，并将今年初已发布的免收上市费、债券经手费等措施有效期再延长两年。',
      '本次新推出的降费措施预计向市场让利13.9亿元，预计本年度深市整体降费金额超过22亿元。',
    ],
  },
  {
    id: 'n-20261122184042992800',
    title: '上交所组合式推出新一批降费措施 助力激发市场主体活力',
    publishedAt: '2026-11-22 18:40',
    source: '金十数据',
    paragraphs: [
      '金十数据11月22日讯，11月22日，上交所发布《关于进一步减免相关费用的通知》，推出新一批降费措施，包括免收交易单元使用费，减免数据中心相关服务费用等，并将今年初已发布的免收上市费、债券经手费等措施有效期再延长两年。',
      '本次新推出的降费措施预计向市场让利13.68亿元，预计本年度沪市整体降费金额超过24亿元。',
    ],
  },
  {
    id: 'n-20261123015954763800',
    title: '特朗普：如果无法达成协议，倾向于新年后打击伊朗',
    publishedAt: '2026-11-23 01:59',
    source: '金十数据',
    paragraphs: [
      '金十数据11月23日讯，据福克斯新闻，美国总统特朗普称，如果无法达成协议，他倾向于在新年之后恢复对伊朗的战争。他说：“美国与伊朗仍在进行间接谈判，但尚未取得实质性成果。”',
      '特朗普形容伊朗人是“专业的踢踏舞者”，并补充道：“他们一直在说个不停。他们除了空谈什么也没做，说的全都是废话。”他还表示，任何试图突破封锁的伊朗船只，都将落得与伊朗其他海军力量一样的下场——沉入海底。',
    ],
  },
]

/** 资讯流按发布时间倒序 */
export function sortedNews(): NewsArticle[] {
  return [...MARKET_NEWS].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

export function getNewsById(id: string): NewsArticle | undefined {
  return MARKET_NEWS.find((news) => news.id === id)
}

// ============ 合规文案 ============

export const RISK_TEXT =
  '黄金价格受国际形势影响波动较大，投资有风险，盈亏由用户自行承担。行情与资讯数据仅供信息参考，不构成投资建议。'
export const RISK_NOTE = '黄金价格波动，盈亏由用户自行承担'
export const NEWS_DISCLAIMER = '资讯仅作信息参考，不构成投资建议，不承诺收益'
export const LOCK_NOTE =
  '下单后成交价以订单确认时的系统报价为准，锁价时效 60 秒，超时自动取消并重新报价'
