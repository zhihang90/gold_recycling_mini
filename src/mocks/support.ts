import { images } from '@/assets/images'
import { STORAGE_KEYS } from './keys'
import { readSession, removeSession, writeSession } from './storage'

/**
 * 在线客服：智能问答 + 转人工 + 会话评价。
 * 原型只做用户端，不接真实 IM；会话态放 sessionStorage。
 */

export type SupportCategory = 'recycle' | 'buy' | 'payment' | 'account' | 'afterSale'

export const SUPPORT_CATEGORIES: { value: SupportCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'recycle', label: '回收服务' },
  { value: 'buy', label: '买金订单' },
  { value: 'payment', label: '支付开票' },
  { value: 'account', label: '账户认证' },
  { value: 'afterSale', label: '售后服务' },
]

export interface SupportFaq {
  id: string
  category: SupportCategory
  question: string
  answer: string
  /** 命中关键词：用户输入包含任一关键词即视为命中该问题 */
  keywords: string[]
  /** 首页优先展示的高频问题 */
  hot?: boolean
}

export const SUPPORT_FAQS: SupportFaq[] = [
  {
    id: 'recycle-flow',
    category: 'recycle',
    question: '回收流程是怎样的？',
    answer:
      '在线估价并提交回收单 → 顺丰上门取件或到店回收 → 检测中心称重检测 → 确认终价 → 打款到收款账户。全程进度可在订单详情查看。',
    keywords: ['回收流程', '怎么回收', '回收步骤', '如何回收'],
    hot: true,
  },
  {
    id: 'recycle-duration',
    category: 'recycle',
    question: '检测需要多久？',
    answer:
      '检测中心签收后 1 个工作日内完成称重与成色检测，检测过程全程直播；您确认终价后当天发起打款。',
    keywords: ['检测多久', '检测时间', '检测需要', '多久出结果'],
    hot: true,
  },
  {
    id: 'recycle-estimate',
    category: 'recycle',
    question: '预估价就是最终到账金额吗？',
    answer: '不是。预估价按实时金价估算，最终以实物检测的克重、成色和您确认的报价为准。',
    keywords: ['预估价', '最终金额', '最终到账', '估价准确'],
  },
  {
    id: 'recycle-reject',
    category: 'recycle',
    question: '不接受报价怎么办？',
    answer: '可以选择原物退回，退回运费由平台承担；如对检测结果有疑问，也可以申请复检。',
    keywords: ['不接受报价', '不卖', '退回', '复检'],
  },
  {
    id: 'recycle-invoice',
    category: 'recycle',
    question: '没有发票可以回收吗？',
    answer:
      '可以。发票不是必备材料，随件附上购买凭证或质检证书能加快核验；物品来源须符合国家相关规定。',
    keywords: ['没有发票', '购买凭证', '来源'],
  },
  {
    id: 'recycle-insurance',
    category: 'recycle',
    question: '寄件需要保价吗？',
    answer: '建议使用顺丰并保价寄出。平台已为用户寄件投保，运输过程中的丢损按保价金额理赔。',
    keywords: ['保价', '寄件', '顺丰', '丢件'],
  },
  {
    id: 'buy-ship',
    category: 'buy',
    question: '下单后多久发货？',
    answer:
      '现货商品在付款后 24 小时内发出，默认顺丰速运；遇节假日或预售商品，以商品详情页说明为准。',
    keywords: ['多久发货', '什么时候发货', '发货时间', '配送'],
    hot: true,
  },
  {
    id: 'buy-address',
    category: 'buy',
    question: '可以修改收货地址吗？',
    answer:
      '未发货前可在订单详情申请修改，客服核实后为您调整；已发货订单需联系快递改派，可能产生额外费用。',
    keywords: ['修改地址', '收货地址', '改地址', '换地址'],
    hot: true,
  },
  {
    id: 'buy-cancel',
    category: 'buy',
    question: '如何取消订单？',
    answer: '待付款订单可直接在订单详情取消；已付款未发货的订单请联系客服拦截，退款将原路退回。',
    keywords: ['取消订单', '不想要了', '取消购买'],
  },
  {
    id: 'buy-certificate',
    category: 'buy',
    question: '商品有质检证书吗？',
    answer:
      '每件投资金商品都随附权威机构质检证书，证书编号可与商品一一对应；请妥善保管，遗失补发需支付相应费用。',
    keywords: ['证书', '质检', '成色', '真伪'],
  },
  {
    id: 'pay-method',
    category: 'payment',
    question: '支持哪些支付方式？',
    answer: '目前支持微信支付、支付宝和云闪付；企业客户可联系客服申请对公转账。',
    keywords: ['支付方式', '微信支付', '支付宝', '云闪付', '怎么付'],
  },
  {
    id: 'pay-invoice',
    category: 'payment',
    question: '发票怎么开具？',
    answer:
      '订单完成后可在订单详情申请开票，支持电子普通发票；增值税专用发票请联系人工客服提交开票资料。',
    keywords: ['发票', '开票', '抬头', '专票'],
    hot: true,
  },
  {
    id: 'pay-refund',
    category: 'payment',
    question: '退款多久到账？',
    answer:
      '退款审核通过后原路退回，微信、支付宝一般 1–3 个工作日到账，银行卡最长 7 个工作日，具体以支付渠道为准。',
    keywords: ['退款', '退钱', '到账时间'],
  },
  {
    id: 'account-phone',
    category: 'account',
    question: '如何修改绑定手机号？',
    answer: '为保障账户安全，手机号修改需完成实名认证后联系人工客服，核验身份后由客服协助变更。',
    keywords: ['修改手机号', '换手机号', '绑定手机'],
  },
  {
    id: 'account-enterprise',
    category: 'account',
    question: '企业认证需要哪些材料？',
    answer:
      '需准备营业执照、法人身份证件、企业对公账户信息，并由法人完成人脸识别；审核通过后即可使用企业账户。',
    keywords: ['企业认证', '营业执照', '对公账户', '法人'],
  },
  {
    id: 'after-sale-damage',
    category: 'afterSale',
    question: '收到商品有破损怎么办？',
    answer:
      '请当场拒收并拍照留证，同时在订单详情提交售后申请；已签收的商品请在 24 小时内联系客服并提供开箱照片。',
    keywords: ['破损', '损坏', '少货', '拒收', '开箱'],
    hot: true,
  },
  {
    id: 'after-sale-response',
    category: 'afterSale',
    question: '售后申请后多久处理？',
    answer:
      '售后申请提交后 1 个工作日内受理，处理进度会通过消息中心同步；涉及检测或物流核实的，处理时间会适当延长。',
    keywords: ['售后处理', '售后多久', '多久回复'],
  },
]

/** 会话角色：智能客服 / 用户 / 人工客服 / 系统提示 */
export type SupportRole = 'bot' | 'user' | 'agent' | 'system'

export type SupportStage = 'bot' | 'queue' | 'agent' | 'closed'

export type SupportServedBy = 'bot' | 'agent'

export interface SupportOrderRef {
  kind: 'sales' | 'recycle'
  id: string
  title: string
  status: string
  /** 状态枚举值，用于跳转对应状态页 */
  statusKey?: string
  amount?: number
}

export interface SupportMessage {
  id: string
  role: SupportRole
  type: 'text' | 'image' | 'order'
  text?: string
  image?: string
  order?: SupportOrderRef
  time: string
}

export interface SupportRating {
  score: number
  tags: string[]
  comment: string
  at: number
}

export interface SupportSession {
  id: string
  topic: string
  stage: SupportStage
  servedBy: SupportServedBy
  messages: SupportMessage[]
  createdAt: number
  updatedAt: number
  orderRef?: SupportOrderRef
  rating?: SupportRating
}

export const SUPPORT_RATE_TAGS = ['响应速度', '服务态度', '专业程度', '问题解决']

export const SUPPORT_QUICK_QUESTIONS = [
  '订单什么时候发货？',
  '怎么修改收货地址？',
  '回收检测需要多久？',
  '发票怎么开具？',
]

const GREETING =
  '您好，我是智能客服小安，很高兴为您服务。请问有什么可以帮您？也可以直接描述订单或回收问题。'

const FALLBACK =
  '抱歉，这个问题我暂时没有找到标准答案。您可以换个说法，或点击下方「转人工客服」由人工客服为您处理。'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

/** 消息时间：HH:mm */
export function supportClock(timestamp = Date.now()) {
  const date = new Date(timestamp)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** 会话时间：今天显示「今天 HH:mm」，其余显示「MM-DD HH:mm」 */
export function supportTimeLabel(timestamp: number) {
  const date = new Date(timestamp)
  const now = new Date()
  const clock = supportClock(timestamp)
  if (date.toDateString() === now.toDateString()) return `今天 ${clock}`
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${clock}`
}

function messageId() {
  return `sm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function textMessage(role: SupportRole, text: string, timestamp = Date.now()): SupportMessage {
  return { id: messageId(), role, type: 'text', text, time: supportClock(timestamp) }
}

function systemMessage(text: string, timestamp = Date.now()): SupportMessage {
  return textMessage('system', text, timestamp)
}

/** 页面追加消息用：文字 / 图片 / 系统提示 */
export function supportTextMessage(role: SupportRole, text: string): SupportMessage {
  return textMessage(role, text)
}

export function supportImageMessage(image: string): SupportMessage {
  return { id: messageId(), role: 'user', type: 'image', image, time: supportClock() }
}

export function supportSystemMessage(text: string): SupportMessage {
  return systemMessage(text)
}

/** 新建会话：默认带一条智能客服欢迎语，从订单进入时自动附上订单卡片 */
export function createSupportSession(orderRef?: SupportOrderRef): SupportSession {
  const now = Date.now()
  const messages: SupportMessage[] = [
    systemMessage('已接入安盛华在线客服', now),
    textMessage(
      'bot',
      orderRef
        ? `您好，我是智能客服小安。已为您关联订单 ${orderRef.id}，请问遇到什么问题？`
        : GREETING,
      now,
    ),
  ]
  if (orderRef) {
    messages.push({
      id: messageId(),
      role: 'bot',
      type: 'order',
      order: orderRef,
      time: supportClock(now),
    })
  }

  return {
    id: `sc-${now}`,
    topic: orderRef ? `${orderRef.title}咨询` : '在线咨询',
    stage: 'bot',
    servedBy: 'bot',
    messages,
    createdAt: now,
    updatedAt: now,
    orderRef,
  }
}

export function readSupportSession(): SupportSession | null {
  return readSession<SupportSession>(STORAGE_KEYS.SUPPORT_SESSION)
}

export function writeSupportSession(session: SupportSession) {
  writeSession(STORAGE_KEYS.SUPPORT_SESSION, session)
}

export function clearSupportSession() {
  removeSession(STORAGE_KEYS.SUPPORT_SESSION)
}

/** 评价页按会话 ID 读取刚结束的会话 */
export function findSupportSession(id: string): SupportSession | null {
  const current = readSupportSession()
  return current?.id === id ? current : null
}

export function rateSupportSession(id: string, rating: SupportRating) {
  const current = readSupportSession()
  if (!current || current.id !== id) return
  writeSupportSession({ ...current, rating, updatedAt: Date.now() })
}

/** 关键词命中：问题 + 关键词 + 问题字符重合度打分，达到阈值才算命中 */
export function matchSupportFaq(text: string): SupportFaq | undefined {
  const normalized = text.replace(/\s/g, '')
  if (!normalized) return undefined

  let best: SupportFaq | undefined
  let bestScore = 0
  for (const faq of SUPPORT_FAQS) {
    let score = 0
    for (const keyword of faq.keywords) {
      if (normalized.includes(keyword)) score += keyword.length >= 4 ? 4 : 2
    }
    const chars = new Set(faq.question.replace(/[，。？?、\s]/g, ''))
    for (const char of chars) {
      if (normalized.includes(char)) score += 0.2
    }
    if (score > bestScore) {
      bestScore = score
      best = faq
    }
  }
  return bestScore >= 2 ? best : undefined
}

/** 智能客服回复：问候语优先，其次标准问答，最后引导转人工 */
export function botReply(text: string): string {
  if (/^(你好|您好|在吗|有人吗|hello|hi)/i.test(text.trim())) {
    return '您好，我是智能客服小安。请描述您遇到的问题，我会先为您查找标准答案。'
  }
  const faq = matchSupportFaq(text)
  if (faq) return `关于「${faq.question}」：${faq.answer}`
  return FALLBACK
}

/** 人工客服回复：按问题类型给出可被评审理解的脚本化答复 */
export function agentReply(text: string, session: SupportSession): string {
  const orderText = session.orderRef ? `订单 ${session.orderRef.id}` : '您的账户'
  if (/物流|快递|发货|运单/.test(text)) {
    return `我已帮您查看${orderText}，物流信息会在揽收后同步到订单详情。如超过 24 小时仍未更新，我再为您向仓库催单。`
  }
  if (/退|退款|退钱/.test(text)) {
    return '退款会原路退回，审核通过后 1–3 个工作日到账。我已为您登记，请留意消息中心的退款通知。'
  }
  if (/发票|开票/.test(text)) {
    return '可以开票。麻烦提供发票抬头与税号，电子普票会在 1 个工作日内发到您的邮箱。'
  }
  if (/报价|终价|检测|克重/.test(text)) {
    return '终价以检测中心的称重与成色结果为准，确认前不会自动成交。您可以在订单详情查看检测进度。'
  }
  return '收到，我这边先为您核实，请稍等 1–2 分钟；有结果会第一时间在本会话回复您。'
}

export type SupportFeedbackType = 'complaint' | 'suggestion' | 'praise'

export const SUPPORT_FEEDBACK_TYPES: { value: SupportFeedbackType; label: string }[] = [
  { value: 'complaint', label: '投诉' },
  { value: 'suggestion', label: '建议' },
  { value: 'praise', label: '表扬' },
]

export interface SupportFeedbackInput {
  type: SupportFeedbackType
  orderId?: string
  description: string
  images: string[]
  phone: string
}

export interface SupportFeedbackRecord extends SupportFeedbackInput {
  submittedAt: number
}

export function submitSupportFeedback(input: SupportFeedbackInput) {
  const stored = readSession<SupportFeedbackRecord[]>(STORAGE_KEYS.SUPPORT_FEEDBACK) ?? []
  writeSession(STORAGE_KEYS.SUPPORT_FEEDBACK, [...stored, { ...input, submittedAt: Date.now() }])
}

/** 演示评价：用于左栏直接预览评价页 */
export function createDemoRateSession(): SupportSession {
  const now = Date.now()
  return {
    id: `sc-demo-rate-${now}`,
    topic: '订单发货时间咨询',
    stage: 'closed',
    servedBy: 'agent',
    messages: [
      systemMessage('已接入安盛华在线客服', now),
      textMessage('bot', GREETING, now),
      systemMessage('会话已结束', now),
    ],
    createdAt: now - 10 * 60 * 1000,
    updatedAt: now,
  }
}

/** 演示会话：用于左栏直接预览「已转人工」的完整聊天形态 */
export function createDemoChatSession(orderRef?: SupportOrderRef): SupportSession {
  const now = Date.now()
  const ref =
    orderRef ??
    ({
      kind: 'sales',
      id: 'SO20261112002',
      title: '生肖金条 20g',
      status: '待发货',
      statusKey: 'pending-shipment',
      amount: 12760,
    } satisfies SupportOrderRef)

  return {
    id: `sc-demo-live-${now}`,
    topic: `${ref.title}咨询`,
    stage: 'agent',
    servedBy: 'agent',
    messages: [
      systemMessage('已接入安盛华在线客服', now),
      textMessage(
        'bot',
        `您好，我是智能客服小安。已为您关联订单 ${ref.id}，请问遇到什么问题？`,
        now,
      ),
      {
        id: messageId(),
        role: 'bot',
        type: 'order',
        order: ref,
        time: supportClock(now),
      },
      textMessage('user', '已经付款两天了，什么时候能发货？', now),
      textMessage('bot', '现货商品在付款后 24 小时内发出，默认顺丰速运。', now),
      systemMessage('正在为您转接人工客服，当前排队 2 位，请稍候…', now),
      systemMessage('人工客服 小安 已接入', now),
      textMessage(
        'agent',
        '您好，我是人工客服小安。已看到您的订单，仓库今天 18:00 前会完成揽收，发出后运单号会同步到订单详情。',
        now,
      ),
      {
        id: messageId(),
        role: 'user',
        type: 'image',
        image: images.photoOverallSample,
        time: supportClock(now),
      },
      textMessage('agent', '图片已收到，商品包装完好，请您放心。还有其他可以帮您的吗？', now),
    ],
    createdAt: now,
    updatedAt: now,
    orderRef: ref,
  }
}
