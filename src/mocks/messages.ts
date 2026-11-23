import { createExternalStore } from '@/stores/createExternalStore'

/**
 * 消息中心：关键交易信息的可追溯收件箱（spec U-23 / A-14~16，信息架构 P-26 / P-27）。
 * - 分类：全部／订单进度／检测直播／终价提醒／资金通知／售后服务／系统通知
 * - 终价待确认 / 终价将超时 / 支付失败 三类未处理关键消息置顶并带操作按钮
 * - 卡片主按钮直达业务页；订单相关消息点卡片直达对应订单详情；系统通知进消息详情
 */

export type MessageCategory = 'order' | 'live' | 'quote' | 'fund' | 'service' | 'system' | 'alert'

export type MessageFilter = MessageCategory | 'all'

/** 卡片或详情页的主操作按钮：to 有值则跳转，toast 有值则弹提示（如联系客服无独立页） */
export interface MessageAction {
  label: string
  to?: string
  toast?: string
  /** 按钮置灰说明（如终价已超时自动接受、订单已关闭） */
  disabledNote?: string
}

export interface MessageItem {
  id: string
  category: MessageCategory
  title: string
  /** 卡片摘要（一行） */
  summary: string
  /** 详情完整内容（仅系统通知的消息详情页展示） */
  content?: string
  time: string
  /** 关联订单号（详情展示） */
  orderId?: string
  /** 关键消息置顶：终价待确认 / 终价将超时 / 支付失败 未处理 */
  pinned: boolean
  /** 终价类卡片显示剩余确认分钟数 */
  remainMin?: number
  /** 卡片主按钮：有值则卡片带按钮直达业务页，不经过详情 */
  action?: MessageAction
  /** 系统通知详情页主操作按钮（订单相关消息不经详情页） */
  detailAction?: MessageAction
  /** 详情次要入口：查看关联订单的目标路由 */
  orderLink?: string
  /** 关键资金与终价类不允许删除，保留期限与交易凭证一致 */
  deletable: boolean
  /** === 金价提醒专属字段（category === 'alert' 时使用） === */
  /** 商品名称（如「黄金涨价提醒」） */
  alertProductName?: string
  /** 目标金价 */
  alertTargetPrice?: number
  /** 报价时间（精确到分钟的完整时间戳） */
  alertQuoteTime?: string
  /** 温馨提示（如「现价775.10元，已到目标」） */
  alertHint?: string
}

/** 分类配置（侧边栏列表用） */
export const MESSAGE_CATEGORIES: { value: MessageFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'alert', label: '金价提醒' },
  { value: 'order', label: '订单进度' },
  { value: 'live', label: '检测直播' },
  { value: 'quote', label: '终价提醒' },
  { value: 'fund', label: '资金通知' },
  { value: 'service', label: '售后服务' },
  { value: 'system', label: '系统通知' },
]

/** 演示消息：覆盖 7 个分类 + 3 类置顶关键消息 + 金价提醒 */
export const DEMO_MESSAGES: MessageItem[] = [
  // === 金价提醒（新分类，按时间倒序置顶） ===
  {
    id: 'm-alert-gold-up',
    category: 'alert',
    title: '金价通知',
    summary: '黄金涨价提醒，目标价 775.08 已触发',
    time: '今天 17:03',
    pinned: false,
    deletable: true,
    alertProductName: '黄金涨价提醒',
    alertTargetPrice: 775.08,
    alertQuoteTime: '2026-11-23 17:03',
    alertHint: '现价 775.10 元/克，已到目标',
    action: { label: '查看金价', to: '/market' },
  },
  {
    id: 'm-alert-gold-down',
    category: 'alert',
    title: '金价通知',
    summary: '黄金跌价提醒，目标价 775.06 已触发',
    time: '今天 16:56',
    pinned: false,
    deletable: true,
    alertProductName: '黄金跌价提醒',
    alertTargetPrice: 775.06,
    alertQuoteTime: '2026-11-23 16:56',
    alertHint: '现价 774.85 元/克，已到目标',
    action: { label: '查看金价', to: '/market' },
  },
  {
    id: 'm-alert-silver-up',
    category: 'alert',
    title: '金价通知',
    summary: '白银涨价提醒，目标价 9.650 已触发',
    time: '今天 15:20',
    pinned: false,
    deletable: true,
    alertProductName: '白银涨价提醒',
    alertTargetPrice: 9.65,
    alertQuoteTime: '2026-11-23 15:20',
    alertHint: '现价 9.672 元/克，已到目标',
    action: { label: '查看金价', to: '/market' },
  },
  // === 原有消息 ===
  {
    id: 'm-quote-timeout',
    category: 'quote',
    title: '终价确认即将超时',
    summary: '订单 RC20261106009 还剩 5 分钟，超时未确认将自动视为接受',
    time: '今天 14:55',
    orderId: 'RC20261106009',
    pinned: true,
    remainMin: 5,
    action: { label: '尽快确认', to: '/orders/recycle/pending-confirm' },
    orderLink: '/orders/recycle/pending-confirm',
    deletable: false,
  },
  {
    id: 'm-quote-pending',
    category: 'quote',
    title: '检测完成，终价待确认',
    summary: '足金 999 检测 8.16g，终价 ¥4,790，请在 30 分钟内确认',
    time: '今天 14:32',
    orderId: 'RC20261106009',
    pinned: true,
    remainMin: 28,
    action: { label: '去确认', to: '/orders/recycle/pending-confirm' },
    orderLink: '/orders/recycle/pending-confirm',
    deletable: false,
  },
  {
    id: 'm-pay-failed',
    category: 'fund',
    title: '打款失败，请更换收款账户',
    summary: '收款支付宝账户超出当日限额，款项未到账，可更换本人支付宝账户重付',
    time: '今天 10:18',
    orderId: 'RC20261103006',
    pinned: true,
    action: {
      label: '去处理',
      to: '/orders/recycle/pending-payment?state=failed&reason=limit',
    },
    orderLink: '/orders/recycle/pending-payment',
    deletable: false,
  },
  {
    id: 'm-live-abnormal',
    category: 'live',
    title: '检测直播推流异常，已切换录像',
    summary: '订单 RC20261109007 直播推流失败，已自动切换为纯录像模式',
    time: '今天 14:20',
    orderId: 'RC20261109007',
    pinned: false,
    action: { label: '查看录像', to: '/orders/recycle/testing?state=replay' },
    orderLink: '/orders/recycle/testing',
    deletable: true,
  },
  {
    id: 'm-live-start',
    category: 'live',
    title: '检测直播即将开始',
    summary: '订单 RC20261109007 将于 30 分钟后开始检测，点击进入观看直播',
    time: '今天 14:00',
    orderId: 'RC20261109007',
    pinned: false,
    action: { label: '看直播', to: '/orders/recycle/testing?state=live' },
    orderLink: '/orders/recycle/testing',
    deletable: true,
  },
  {
    id: 'm-order-received',
    category: 'order',
    title: '快件已签收，进入检测',
    summary: '订单 RC20261112010 检测中心已签收，即将开始称重与成色检测',
    time: '今天 09:42',
    orderId: 'RC20261112010',
    pinned: false,
    action: { label: '查看订单', to: '/orders/recycle/pending-receipt' },
    orderLink: '/orders/recycle/pending-receipt',
    deletable: true,
  },
  {
    id: 'm-logistics-abnormal',
    category: 'order',
    title: '物流异常，需确认退回地址',
    summary: '订单 RC20261112010 快件地址异常，请及时查看并联系客服处理',
    time: '昨天 16:30',
    orderId: 'RC20261112010',
    pinned: false,
    action: { label: '查看物流', to: '/orders/recycle/pending-receipt' },
    orderLink: '/orders/recycle/pending-receipt',
    deletable: true,
  },
  {
    id: 'm-paid',
    category: 'fund',
    title: '回收款已到账',
    summary: '订单 RC20261026005 回收款 ¥4,790 已打入您的收款账户',
    time: '昨天 11:05',
    orderId: 'RC20261026005',
    pinned: false,
    action: { label: '查看凭证', to: '/orders/recycle/completed' },
    orderLink: '/orders/recycle/completed',
    deletable: false,
  },
  {
    id: 'm-ticket-reply',
    category: 'service',
    title: '客服回复了您的工单',
    summary: '关于订单 RC20261101003 退回进度的咨询，客服已回复处理结果',
    time: '11-18 15:20',
    orderId: 'RC20261101003',
    pinned: false,
    orderLink: '/orders/recycle/closed',
    deletable: true,
  },
  {
    id: 'm-order-cancelled',
    category: 'order',
    title: '订单已取消',
    summary: '订单 RC20261108004 已取消，未产生任何费用',
    time: '11-16 14:00',
    orderId: 'RC20261108004',
    pinned: false,
    action: { label: '查看订单', to: '/orders/recycle/cancelled' },
    orderLink: '/orders/recycle/cancelled',
    deletable: true,
  },
  {
    id: 'm-system-quote-valid',
    category: 'system',
    title: '估价有效期提醒',
    summary: '您的估价单将在 24 小时后失效，请尽快完成寄件',
    content:
      '您的黄金回收估价单将在 24 小时后失效。估价基于当前上海黄金交易所实时金价，失效后需重新估价。请尽快完成预约与寄件，以免金价波动影响回收金额。',
    time: '11-18 09:00',
    pinned: false,
    deletable: true,
  },
  {
    id: 'm-system-auth',
    category: 'system',
    title: '实名认证已通过',
    summary: '您的实名认证已审核通过，可正常使用回收服务',
    content:
      '您提交的实名认证信息已审核通过。根据监管要求，黄金回收需完成实名核验，认证通过后您可正常使用估价、寄件、回收款结算等全部服务。',
    time: '11-17 10:30',
    pinned: false,
    deletable: true,
  },
]

/* ---------------- 已读状态 store ---------------- */

interface MessageReadState {
  readMap: Record<string, boolean>
}

/** 初始已读：较早的消息标记已读，其余未读，用于演示角标与已读/未读区分 */
const initialReadMap: Record<string, boolean> = {
  'm-paid': true,
  'm-order-cancelled': true,
  'm-system-auth': true,
  'm-system-quote-valid': true,
  'm-logistics-abnormal': true,
}

const store = createExternalStore<MessageReadState>({ readMap: initialReadMap })

/** 订阅已读状态，用于页面重渲染（角标、已读样式） */
export function useMessageReadState() {
  return store.useStore()
}

export function isMessageRead(id: string, state?: MessageReadState) {
  const s = state ?? store.getState()
  return !!s.readMap[id]
}

/** 进入详情即标记已读（V1.3 P-27 规则） */
export function markMessageRead(id: string) {
  store.update((s) => (s.readMap[id] ? s : { ...s, readMap: { ...s.readMap, [id]: true } }))
}

/** 全部已读：仅对可删除/普通消息生效？spec 说支持「全部已读」，对所有消息标记已读 */
export function markAllMessagesRead() {
  const readMap: Record<string, boolean> = {}
  DEMO_MESSAGES.forEach((m) => {
    readMap[m.id] = true
  })
  store.replace({ readMap })
}

/** 全部未读数（订单列表角标用） */
export function messageUnreadCount(state?: MessageReadState) {
  const s = state ?? store.getState()
  return DEMO_MESSAGES.filter((m) => !s.readMap[m.id]).length
}

/** 某分类下的未读数（分类 Tab 角标用） */
export function unreadCountByCategory(category: MessageFilter, state?: MessageReadState) {
  const s = state ?? store.getState()
  return DEMO_MESSAGES.filter(
    (m) => !s.readMap[m.id] && (category === 'all' || m.category === category),
  ).length
}

export function getMessageById(id: string) {
  return DEMO_MESSAGES.find((m) => m.id === id)
}

/** 按分类过滤，置顶消息始终在前，其次按数组顺序（演示数据已按时间倒序） */
export function filterMessages(category: MessageFilter): MessageItem[] {
  const list = category === 'all' ? DEMO_MESSAGES : DEMO_MESSAGES.filter((m) => m.category === category)
  return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned))
}
