/** 回收订单：与买金订单并行展示，状态沿用回收流程的五个业务节点。 */
import type { OrderStatusTone } from '@/lib/statusTone'

export type RecycleStatus =
  | 'pending-ship'
  | 'testing'
  | 'pending-confirm'
  | 'pending-payment'
  | 'completed'

export interface RecycleOrder {
  id: string
  status: RecycleStatus
  createdAt: string
  category: string
  weight: string
  purity: string
  estimate: number
  /** 回收方式：顺丰上门取件 / 到店回收 */
  method: string
  /** 黄金来源，与协议确认页的选择一致 */
  source: string
  /** 上门取件信息 */
  pickup?: {
    name: string
    phone: string
    region: string
    detail: string
    window: string
  }
  /** 检测机构 */
  center?: string
  /** 检测结果：用于待确认 / 待打款 / 已完成 */
  inspection?: {
    weight: string
    purity: string
    amount: number
    finishedAt: string
  }
  /** 打款信息 */
  payment?: {
    account: string
    amount: number
    eta?: string
    paidAt?: string
  }
}

export const RECYCLE_STATUS_LABEL: Record<RecycleStatus, string> = {
  'pending-ship': '待寄出',
  testing: '检测中',
  'pending-confirm': '待确认',
  'pending-payment': '待打款',
  completed: '已完成',
}

/** 状态语义色：待用户处理用橙、进行中用蓝、待打款用绿、完结用中性。 */
export const RECYCLE_STATUS_TONE: Record<RecycleStatus, OrderStatusTone> = {
  'pending-ship': 'warning',
  testing: 'info',
  'pending-confirm': 'warning',
  'pending-payment': 'success',
  completed: 'muted',
}

export const RECYCLE_FILTERS: { value: 'all' | RecycleStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending-ship', label: '待寄出' },
  { value: 'testing', label: '检测中' },
  { value: 'pending-confirm', label: '待确认' },
  { value: 'pending-payment', label: '待打款' },
  { value: 'completed', label: '已完成' },
]

/** 进度弹层使用的节点顺序，订单状态对应其中一段 */
export const RECYCLE_STEPS = [
  { key: 'pending-ship', label: '待寄出', description: '预约顺丰上门取件' },
  { key: 'testing', label: '检测中', description: '到仓称重、光谱检测' },
  { key: 'pending-confirm', label: '待确认', description: '确认最终检测克重与报价' },
  { key: 'pending-payment', label: '待打款', description: '确认后 2 小时内打款' },
  { key: 'completed', label: '已完成', description: '款项已到账' },
] as const

const PICKUP = {
  name: '陈先生',
  phone: '176****5090',
  region: '广东省深圳市盐田区',
  detail: '梧桐路太平洋工业区 3 栋 6 楼',
  window: '11 月 20 日（后天）19:00 – 20:00',
}

export const DEMO_RECYCLE_ORDERS: RecycleOrder[] = [
  {
    id: 'RC20261114008',
    status: 'pending-ship',
    createdAt: '2026-11-14 18:12',
    category: '足金首饰',
    weight: '12.5g',
    purity: '足金 999',
    estimate: 7320,
    method: '顺丰上门取件',
    source: '个人持有',
    center: '南京国检中心',
    pickup: PICKUP,
  },
  {
    id: 'RC20261109007',
    status: 'testing',
    createdAt: '2026-11-09 10:35',
    category: '投资金条',
    weight: '20g',
    purity: '足金 999.9',
    estimate: 11860,
    method: '顺丰上门取件',
    source: '他人赠与',
    center: '南京国检中心',
    pickup: PICKUP,
  },
  {
    id: 'RC20261106009',
    status: 'pending-confirm',
    createdAt: '2026-11-06 09:18',
    category: '足金首饰',
    weight: '8.3g',
    purity: '足金 999',
    estimate: 4860,
    method: '顺丰上门取件',
    source: '个人持有',
    center: '南京国检中心',
    pickup: PICKUP,
    inspection: {
      weight: '8.16g',
      purity: '足金 999',
      amount: 4790,
      finishedAt: '2026-11-06 17:20',
    },
  },
  {
    id: 'RC20261103006',
    status: 'pending-payment',
    createdAt: '2026-11-03 15:47',
    category: '足金首饰',
    weight: '8.2g',
    purity: '足金 999',
    estimate: 4820,
    method: '顺丰上门取件',
    source: '个人持有',
    center: '南京国检中心',
    pickup: PICKUP,
    inspection: {
      weight: '8.16g',
      purity: '足金 999',
      amount: 4790,
      finishedAt: '2026-11-03 17:20',
    },
    payment: {
      account: '平安银行 **** 9455',
      amount: 4790,
      eta: '预计 2 小时内到账',
    },
  },
  {
    id: 'RC20261026005',
    status: 'completed',
    createdAt: '2026-10-26 09:20',
    category: '金币',
    weight: '5g',
    purity: '足金 999',
    estimate: 2960,
    method: '顺丰上门取件',
    source: '活动获得',
    center: '南京国检中心',
    pickup: PICKUP,
    inspection: {
      weight: '4.96g',
      purity: '足金 999',
      amount: 2952,
      finishedAt: '2026-10-26 14:40',
    },
    payment: {
      account: '平安银行 **** 9455',
      amount: 2952,
      paidAt: '2026-10-26 15:08',
    },
  },
]
