import type { ShippingAddress } from './addressBook'

export interface LogisticsGroup {
  status: string
  entries: { text: string; time: string }[]
}

export interface LogisticsInfo {
  carrier: string
  trackingNo: string
  address?: string
  groups: LogisticsGroup[]
}

/** 顺丰演示轨迹：按物流节点分组、最新在上；订单列表与订单详情共用同一份内容 */
export const DEMO_LOGISTICS_GROUPS: LogisticsGroup[] = [
  {
    status: '派送中',
    entries: [{ text: '您的快件正在派送中，请保持电话畅通。', time: '2026-11-06 10:20' }],
  },
  {
    status: '运输中',
    entries: [
      { text: '您的快件已到达【深圳南山集散中心】', time: '2026-11-06 08:35' },
      {
        text: '您的快件已离开【广州白云集散中心】，正在发往下一站【深圳南山集散中心】',
        time: '2026-11-05 22:10',
      },
      { text: '您的快件已到达【广州白云集散中心】', time: '2026-11-05 18:42' },
    ],
  },
  {
    status: '已揽收',
    entries: [{ text: '顺丰速运已收取快件', time: '2026-11-05 15:08' }],
  },
  {
    status: '已下单',
    entries: [{ text: '您的订单已提交，等待快递员上门取件', time: '2026-11-05 14:52' }],
  },
]

/** 收货地址展示文案：省市区 + 详细地址 + 门牌号 */
export function formatShippingAddress(address?: ShippingAddress) {
  if (!address) return undefined
  return [address.region, address.place, address.doorNo].filter(Boolean).join(' ')
}
