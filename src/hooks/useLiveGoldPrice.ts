import { useSyncExternalStore } from 'react'

import { currentGoldPrice, subscribeGoldPrice } from '@/mocks/pricing'

/** 订阅上金所实时金价，报价刷新时触发所在组件重渲染。 */
export function useLiveGoldPrice() {
  return useSyncExternalStore(subscribeGoldPrice, currentGoldPrice, currentGoldPrice)
}
