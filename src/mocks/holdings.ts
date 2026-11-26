/** 持仓与资金：首版为静态演示数据，登录后展示 */

export interface HoldingLot {
  id: string
  /** 商品名称 */
  name: string
  /** 规格，如 50g */
  spec: string
  /** 重量（克） */
  grams: number
  /** 买入单价（元/克） */
  buyPrice: number
  /** 当前市值（元） */
  marketValue: number
  /** 买入成本（元） */
  cost: number
  /** 买入时间 */
  boughtAt: string
}

/** 账户可用余额（元） */
export const HOLDINGS_BALANCE = 5000

/** 资金流水场景：购金、充值、提现、回收到账、售后退款 */
export type LedgerScene = 'purchase' | 'recharge' | 'withdraw' | 'recycle' | 'refund'

export interface LedgerEntry {
  id: string
  scene: LedgerScene
  /** 流水标题，如「购金支出」 */
  title: string
  /** 关联单号或渠道说明 */
  meta: string
  /** 发生时间 */
  at: string
  /** 金额变动（元）：正数入账，负数出账 */
  amount: number
  /** 当前处理状态文案 */
  statusText: string
  statusTone: 'success' | 'warning' | 'muted' | 'danger'
}

/** 资金流水演示：覆盖成功、处理中、已退回三类结果 */
export const HOLDINGS_LEDGER: LedgerEntry[] = [
  {
    id: 'lg-20261124-withdraw',
    scene: 'withdraw',
    title: '提现',
    meta: '招商银行（尾号 8821）',
    at: '2026-11-24 11:18:05',
    amount: -2000,
    statusText: '处理中',
    statusTone: 'warning',
  },
  {
    id: 'lg-20261120-recycle',
    scene: 'recycle',
    title: '回收到账',
    meta: '回收订单 RC20261120008',
    at: '2026-11-20 15:06:12',
    amount: 6120,
    statusText: '交易成功',
    statusTone: 'success',
  },
  {
    id: 'lg-20261118-refund',
    scene: 'refund',
    title: '售后退款',
    meta: '订单号 SO20261105003',
    at: '2026-11-18 10:24:36',
    amount: 3451.55,
    statusText: '交易成功',
    statusTone: 'success',
  },
  {
    id: 'lg-20261115-purchase',
    scene: 'purchase',
    title: '购金支出',
    meta: '订单号 SO20261115006',
    at: '2026-11-15 09:31:20',
    amount: -3451.55,
    statusText: '交易成功',
    statusTone: 'success',
  },
  {
    id: 'lg-20261112-withdraw',
    scene: 'withdraw',
    title: '提现',
    meta: '中国建设银行（尾号 3390）',
    at: '2026-11-12 20:03:44',
    amount: -1000,
    statusText: '交易失败',
    statusTone: 'danger',
  },
  {
    id: 'lg-20261110-recharge',
    scene: 'recharge',
    title: '充值',
    meta: '微信支付',
    at: '2026-11-10 18:22:41',
    amount: 10000,
    statusText: '交易成功',
    statusTone: 'success',
  },
]

export const HOLDINGS_LOTS: HoldingLot[] = [
  {
    id: 'lot-20261107',
    name: '中国黄金 投资金条',
    spec: '50克',
    grams: 50,
    buyPrice: 608.5,
    marketValue: 30525,
    cost: 30425,
    boughtAt: '2026-11-07 15:20:49',
  },
]

export interface HoldingsOverview {
  /** 持仓总重量（克） */
  grams: number
  /** 当前市值（元） */
  marketValue: number
  /** 持仓成本（元） */
  cost: number
  /** 持仓盈亏（元） */
  profit: number
  /** 收益率（%） */
  profitRate: number
}

/** 汇总持仓：重量、市值、盈亏与收益率 */
export function holdingsOverview(): HoldingsOverview {
  const grams = HOLDINGS_LOTS.reduce((sum, lot) => sum + lot.grams, 0)
  const marketValue = HOLDINGS_LOTS.reduce((sum, lot) => sum + lot.marketValue, 0)
  const cost = HOLDINGS_LOTS.reduce((sum, lot) => sum + lot.cost, 0)
  const profit = marketValue - cost
  return {
    grams,
    marketValue,
    cost,
    profit,
    profitRate: cost > 0 ? (profit / cost) * 100 : 0,
  }
}
