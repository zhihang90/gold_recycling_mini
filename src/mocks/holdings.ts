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

export const HOLDINGS_LOTS: HoldingLot[] = [
  {
    id: 'lot-20261107',
    name: '中国黄金 投资金条',
    spec: '50g',
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
