import { round2 } from '@/lib/money'

import { BAR_PRICE_TIERS, getLivePrice, getMarketLastUpdatedAt, simulateMarketTick } from './market'

/** 全站唯一金价口径：上金所 Au99.99（元/克） */
export const GOLD_PRICE_CODE = 'au9999'
/** 实时报价刷新间隔（毫秒） */
export const GOLD_PRICE_TICK_MS = 3000

/** 当前实时金价（元/克） */
export function currentGoldPrice() {
  return getLivePrice(GOLD_PRICE_CODE)
}

/** 最近一次报价刷新时间（毫秒） */
export function goldPriceUpdatedAt() {
  return getMarketLastUpdatedAt()
}

/** 克重档位工费（元/克）：取不超过该克重的最大档位，少于最小档按最小档、超出最大档沿用最高档 */
export function feePerGram(grams: number) {
  let fee: number = BAR_PRICE_TIERS[0].fee
  for (const tier of BAR_PRICE_TIERS) {
    if (grams < tier.grams) break
    fee = tier.fee
  }
  return fee
}

/** 克单价 = 实时金价 + 该克重档位的单克工费 */
export function unitPriceOf(grams: number, livePrice = currentGoldPrice()) {
  return round2(livePrice + feePerGram(grams))
}

/** 销售价 = 克重 ×（实时金价 + 该克重档位的单克工费） */
export function salePriceOf(grams: number, livePrice = currentGoldPrice()) {
  return round2(grams * (livePrice + feePerGram(grams)))
}

/** 回收服务费：按实时金价的 2% 扣减 */
export const RECYCLE_SERVICE_RATE = 0.02

/** 回收价 = 实时金价 ×（1 - 服务费比例） */
export function recyclePriceOf(livePrice = currentGoldPrice()) {
  return round2(livePrice * (1 - RECYCLE_SERVICE_RATE))
}

// ---- 实时金价订阅：首个订阅者启动统一节拍，页面隐藏时暂停 ----

const listeners = new Set<() => void>()
let timer: number | null = null

function tick() {
  simulateMarketTick()
  listeners.forEach((listener) => listener())
}

function onVisible() {
  if (!document.hidden) tick()
}

/** 订阅实时金价变化，返回取消订阅函数；全站共用同一个刷新节拍。 */
export function subscribeGoldPrice(listener: () => void) {
  listeners.add(listener)
  if (timer === null) {
    timer = window.setInterval(() => {
      if (!document.hidden) tick()
    }, GOLD_PRICE_TICK_MS)
    document.addEventListener('visibilitychange', onVisible)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && timer !== null) {
      window.clearInterval(timer)
      timer = null
      document.removeEventListener('visibilitychange', onVisible)
    }
  }
}
