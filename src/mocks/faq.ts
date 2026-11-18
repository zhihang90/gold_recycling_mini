/** 首页「大家都在问」：按用户真实决策路径分组，问题即入口，答案就地展开。 */
export type FaqCategory = 'recycle' | 'pricing' | 'shipping'

export interface FaqItem {
  id: string
  category: FaqCategory
  question: string
  answer: string
}

export const FAQ_CATEGORIES: { value: FaqCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'recycle', label: '回收须知' },
  { value: 'pricing', label: '计价结算' },
  { value: 'shipping', label: '寄件检测' },
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'scope',
    category: 'recycle',
    question: '可以回收哪些物品？',
    answer: '目前支持足金首饰、投资金条和金币。K 金、镶嵌类及来源不明的物品暂不支持。',
  },
  {
    id: 'invoice',
    category: 'recycle',
    question: '没有发票可以回收吗？',
    answer: '可以。发票不是必备材料，随件附上购买凭证或质检证书能加快核验；来源须符合国家相关规定。',
  },
  {
    id: 'estimate',
    category: 'pricing',
    question: '预估价就是最终到账金额吗？',
    answer: '不是。预估价按实时金价估算，最终以实物检测的克重与成色、并经您确认的报价为准。',
  },
  {
    id: 'fee',
    category: 'pricing',
    question: '服务费怎么收？',
    answer: '按下单页展示的费率收取，报价即到手价，检测、称重、提纯等环节不再另扣费用。',
  },
  {
    id: 'lock',
    category: 'pricing',
    question: '金价波动时按哪个时点计价？',
    answer: '以您确认终价时的实时金价为基准。确认之前金价变动不影响已锁定的报价。',
  },
  {
    id: 'reject',
    category: 'pricing',
    question: '不接受报价怎么办？',
    answer: '可以选择原物退回，运费由我们承担；如对检测结果有疑问，也可以申请复检。',
  },
  {
    id: 'shipping',
    category: 'shipping',
    question: '寄件需要保价吗？',
    answer: '建议选择顺丰并保价寄出。运输过程中的丢损按保价金额理赔，寄件地址与包装要求见寄件指引。',
  },
  {
    id: 'duration',
    category: 'shipping',
    question: '检测需要多久？',
    answer: '签收后 1 个工作日内完成检测并全程直播，您确认终价后当天发起打款。',
  },
]
