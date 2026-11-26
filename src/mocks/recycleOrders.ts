/**
 * 回收订单：按《业务边界与功能清单 V2.4》三层模型设计。
 * 系统主状态 9 个 → C 端阶段 5 个（订单详情进度条）→ 列表 Tab 5 个（用户待办）。
 */
import type { OrderStatusTone } from '@/lib/statusTone'

export type RecycleStatus =
  | 'review'
  | 'pending-ship'
  | 'pending-receipt'
  | 'testing'
  | 'pending-confirm'
  | 'pending-payment'
  | 'completed'
  | 'cancelled'
  | 'closed'

/** C 端阶段：客观业务进度，用户侧只读；待打款不占阶段，作为「确认终价」的子节点 */
export type RecycleStage = 'review' | 'shipping' | 'testing' | 'confirm' | 'done'

/** 列表 Tab：用户视角的待办聚合，与系统状态多对一 */
export type RecycleTab = 'all' | 'pending-ship' | 'pending-confirm' | 'completed' | 'after-sale'

/** 物流轨迹节点：按时间倒序存放，第一条为最新 */
export interface LogisticsEntry {
  time: string
  text: string
}

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
  /** 寄件人信息（下单人） */
  sender: {
    name: string
    phone: string
    address: string
  }
  /** 收件方：检测中心 */
  receiver: {
    name: string
    phone: string
    address: string
  }
  /** 物流信息：审核通过后才生成寄件单，审核中订单没有运单 */
  logistics?: {
    carrier: string
    trackingNo: string
    entries: LogisticsEntry[]
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
  /** 取消 / 关闭原因；已取消、已关闭订单使用 */
  closeReason?: string
  closedAt?: string
  /** 关闭前走到的阶段，用于进度条停留在正确节点 */
  stageAtClose?: RecycleStage
  /** 检测直播状态：列表卡片展示「直播中」角标 */
  live?: 'live' | 'upcoming' | 'replay'
  /** 待确认剩余分钟数，列表卡片倒计时用 */
  confirmRemainMin?: number
  /** 退回运单：拒绝终价 / 拒收等场景 */
  returnTrackingNo?: string
  returnEntries?: LogisticsEntry[]
}

export const RECYCLE_STATUS_LABEL: Record<RecycleStatus, string> = {
  review: '审核中',
  'pending-ship': '待寄出',
  'pending-receipt': '待签收',
  testing: '检测中',
  'pending-confirm': '待确认',
  'pending-payment': '待打款',
  completed: '已完成',
  cancelled: '已取消',
  closed: '已关闭',
}

/** 状态语义色：待用户处理用橙、进行中用蓝、完结用中性。 */
export const RECYCLE_STATUS_TONE: Record<RecycleStatus, OrderStatusTone> = {
  review: 'info',
  'pending-ship': 'warning',
  'pending-receipt': 'info',
  testing: 'info',
  'pending-confirm': 'warning',
  'pending-payment': 'info',
  completed: 'muted',
  cancelled: 'muted',
  closed: 'muted',
}

/** 用户侧进度条固定 5 段，覆盖 9 个系统主状态 */
export const RECYCLE_STAGES: { key: RecycleStage; label: string; description: string }[] = [
  { key: 'review', label: '订单审核', description: '校验实名、协议与物品信息' },
  { key: 'shipping', label: '邮寄运输', description: '上门取件、快递在途' },
  { key: 'testing', label: '专业检测', description: '到仓称重、成色与真伪检测' },
  { key: 'confirm', label: '确认终价', description: '30 分钟内确认终价' },
  { key: 'done', label: '已完成', description: '回收款已到账' },
]

/** 阶段名称索引：列表卡片直接展示「订单审核 / 邮寄运输…」 */
export const RECYCLE_STAGE_LABEL: Record<RecycleStage, string> = {
  review: '订单审核',
  shipping: '邮寄运输',
  testing: '专业检测',
  confirm: '确认终价',
  done: '已完成',
}

/** 系统状态 → C 端阶段；已取消 / 已关闭按关闭前走到的阶段停留 */
export function recycleStageOf(order: Pick<RecycleOrder, 'status' | 'stageAtClose'>): RecycleStage {
  if (order.stageAtClose) return order.stageAtClose
  switch (order.status) {
    case 'review':
      return 'review'
    case 'pending-ship':
    case 'pending-receipt':
      return 'shipping'
    case 'testing':
      return 'testing'
    case 'pending-confirm':
    case 'pending-payment':
      return 'confirm'
    case 'completed':
      return 'done'
    case 'cancelled':
      return 'shipping'
    case 'closed':
      return 'confirm'
  }
}

/** 列表 Tab：只把用户要处理的节点与终态聚合出来，中间等待态只在「全部」出现 */
export const RECYCLE_TABS: { value: RecycleTab; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending-ship', label: '待寄出' },
  { value: 'pending-confirm', label: '待确认' },
  { value: 'completed', label: '已完成' },
  { value: 'after-sale', label: '已取消' },
]

/** 状态归属的 Tab；审核中、待签收、检测中、待打款不单独设 Tab，返回 null */
export function recycleTabOf(status: RecycleStatus): Exclude<RecycleTab, 'all'> | null {
  switch (status) {
    case 'pending-ship':
      return 'pending-ship'
    case 'pending-confirm':
      return 'pending-confirm'
    case 'completed':
      return 'completed'
    case 'cancelled':
    case 'closed':
      return 'after-sale'
    default:
      return null
  }
}

/** 订单是否属于指定 Tab（「全部」始终匹配） */
export function matchesRecycleTab(status: RecycleStatus, tab: RecycleTab) {
  return tab === 'all' || recycleTabOf(status) === tab
}

/** 寄件人：演示统一为下单人陈先生 */
const SENDER = {
  name: '陈先生',
  phone: '176****5090',
  address: '广东省深圳市盐田区梧桐路太平洋工业区 3 栋 6 楼',
}

/** 收件方：所有回收单统一寄往安盛华集团检测中心 */
const RECEIVER = {
  name: '安盛华集团检测中心',
  phone: '0755-2688 3066',
  address: '广东省深圳市盐田区市保税区沙头角太平洋工业区3栋6楼',
}

/** 上门取件时段，仅待寄出状态展示 */
export const RECYCLE_PICKUP_WINDOW = '11 月 20 日（后天）19:00 – 20:00'

/**
 * 演示订单：每个系统主状态各一条固定数据，评审时内容不随操作漂移。
 * 审核中订单还没有运单（审核通过才生成寄件单）。
 */
export const DEMO_RECYCLE_ORDERS: RecycleOrder[] = [
  {
    id: 'RC20261119012',
    status: 'review',
    createdAt: '2026-11-19 09:12',
    category: '足金首饰',
    weight: '15.2克',
    purity: '足金 999',
    estimate: 8900,
    method: '顺丰上门取件',
    source: '个人持有',
    sender: SENDER,
    receiver: RECEIVER,
  },
  {
    id: 'RC20261114008',
    status: 'pending-ship',
    createdAt: '2026-11-14 18:12',
    category: '足金首饰',
    weight: '12.5克',
    purity: '足金 999',
    estimate: 7320,
    method: '顺丰上门取件',
    source: '个人持有',
    sender: SENDER,
    receiver: RECEIVER,
    logistics: {
      carrier: '顺丰速运',
      trackingNo: 'SF1435901120458',
      entries: [
        {
          time: '11-14 18:12',
          text: `顺丰速运已接单，取件时段 ${RECYCLE_PICKUP_WINDOW}`,
        },
      ],
    },
    center: '安盛华集团检测中心',
  },
  {
    id: 'RC20261112010',
    status: 'pending-receipt',
    createdAt: '2026-11-12 14:26',
    category: '投资金条',
    weight: '20克',
    purity: '足金 999.9',
    estimate: 11860,
    method: '顺丰上门取件',
    source: '个人持有',
    sender: SENDER,
    receiver: RECEIVER,
    logistics: {
      carrier: '顺丰速运',
      trackingNo: 'SF1435897302651',
      entries: [
        { time: '11-12 16:40', text: '快件运输中，预计次日送达检测中心' },
        { time: '11-12 15:05', text: '顺丰速运已揽收，运输中' },
        { time: '11-12 14:26', text: '快递员已上门取件' },
      ],
    },
    center: '安盛华集团检测中心',
  },
  {
    id: 'RC20261109007',
    status: 'testing',
    createdAt: '2026-11-09 10:35',
    category: '投资金条',
    weight: '20克',
    purity: '足金 999.9',
    estimate: 11860,
    method: '顺丰上门取件',
    source: '他人赠与',
    sender: SENDER,
    receiver: RECEIVER,
    logistics: {
      carrier: '顺丰速运',
      trackingNo: 'SF1435892750123',
      entries: [
        { time: '11-09 14:10', text: '快件已到达检测中心，正在排队检测' },
        { time: '11-09 11:20', text: '顺丰速运已揽收，运输中' },
        { time: '11-09 10:35', text: '已预约上门取件，等待快递员上门' },
      ],
    },
    center: '安盛华集团检测中心',
    live: 'live',
  },
  {
    id: 'RC20261106009',
    status: 'pending-confirm',
    createdAt: '2026-11-06 09:18',
    category: '足金首饰',
    weight: '8.3克',
    purity: '足金 999',
    estimate: 4860,
    method: '顺丰上门取件',
    source: '个人持有',
    sender: SENDER,
    receiver: RECEIVER,
    logistics: {
      carrier: '顺丰速运',
      trackingNo: 'SF1435889017465',
      entries: [
        { time: '11-06 17:20', text: '检测完成，已出具检测报告' },
        { time: '11-06 15:30', text: '快件已到达检测中心' },
        { time: '11-06 10:05', text: '顺丰速运已揽收，运输中' },
        { time: '11-06 09:18', text: '已预约上门取件，等待快递员上门' },
      ],
    },
    inspection: {
      weight: '8.16克',
      purity: '足金 999',
      amount: 4790,
      finishedAt: '2026-11-06 17:20',
    },
    confirmRemainMin: 28,
  },
  {
    id: 'RC20261103006',
    status: 'pending-payment',
    createdAt: '2026-11-03 15:47',
    category: '足金首饰',
    weight: '8.2克',
    purity: '足金 999',
    estimate: 4820,
    method: '顺丰上门取件',
    source: '个人持有',
    sender: SENDER,
    receiver: RECEIVER,
    logistics: {
      carrier: '顺丰速运',
      trackingNo: 'SF1435776620918',
      entries: [
        { time: '11-03 17:35', text: '终价已确认，等待打款' },
        { time: '11-03 17:20', text: '检测完成，已出具检测报告' },
        { time: '11-03 17:05', text: '快件已到达检测中心' },
        { time: '11-03 16:20', text: '顺丰速运已揽收，运输中' },
        { time: '11-03 15:47', text: '已预约上门取件，等待快递员上门' },
      ],
    },
    inspection: {
      weight: '8.16克',
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
    weight: '5克',
    purity: '足金 999',
    estimate: 2960,
    method: '顺丰上门取件',
    source: '活动获得',
    sender: SENDER,
    receiver: RECEIVER,
    logistics: {
      carrier: '顺丰速运',
      trackingNo: 'SF1435665304721',
      entries: [
        { time: '10-26 15:08', text: '回收款已打款至平安银行 **** 9455' },
        { time: '10-26 14:40', text: '检测完成，已出具检测报告' },
        { time: '10-26 13:30', text: '快件已到达检测中心' },
        { time: '10-26 09:50', text: '顺丰速运已揽收，运输中' },
        { time: '10-26 09:20', text: '已预约上门取件，等待快递员上门' },
      ],
    },
    inspection: {
      weight: '4.96克',
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
  {
    id: 'RC20261108004',
    status: 'cancelled',
    createdAt: '2026-11-08 11:05',
    category: '足金首饰',
    weight: '6.0克',
    purity: '足金 999',
    estimate: 3520,
    method: '顺丰上门取件',
    source: '个人持有',
    sender: SENDER,
    receiver: RECEIVER,
    logistics: {
      carrier: '顺丰速运',
      trackingNo: 'SF1435820116743',
      entries: [
        { time: '11-08 12:20', text: '用户取消订单，取件任务已撤销' },
        { time: '11-08 11:05', text: '顺丰速运已接单，等待上门取件' },
      ],
    },
    closeReason: '用户主动取消，未产生任何费用',
    closedAt: '2026-11-08 12:20',
    stageAtClose: 'shipping',
  },
  {
    id: 'RC20261101003',
    status: 'closed',
    createdAt: '2026-11-01 08:40',
    category: '金币',
    weight: '5克',
    purity: '足金 999',
    estimate: 2960,
    method: '顺丰上门取件',
    source: '活动获得',
    sender: SENDER,
    receiver: RECEIVER,
    logistics: {
      carrier: '顺丰速运',
      trackingNo: 'SF1435719024588',
      entries: [
        { time: '11-01 12:10', text: '检测完成，已出具检测报告' },
        { time: '11-01 10:05', text: '快件已到达检测中心' },
        { time: '11-01 08:40', text: '顺丰速运已揽收，运输中' },
      ],
    },
    inspection: {
      weight: '4.92克',
      purity: '足金 999',
      amount: 2940,
      finishedAt: '2026-11-01 12:10',
    },
    closeReason: '拒绝终价，物品已退回并签收',
    closedAt: '2026-11-02 16:30',
    stageAtClose: 'confirm',
    returnTrackingNo: 'SF1435726641980',
    returnEntries: [
      { time: '11-02 16:30', text: '退回物品已签收，订单关闭' },
      { time: '11-02 09:15', text: '退回快件运输中' },
      { time: '11-01 14:20', text: '退回快件已揽收，费用由平台承担' },
    ],
  },
]
