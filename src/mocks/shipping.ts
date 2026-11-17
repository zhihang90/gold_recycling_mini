import type { RuleSection } from '@/components/RuleSheet'
import type { TabItem } from '@/components/SegmentedTabs'

export const PICKUP_SLOTS = [
  { value: 'day1-am', label: '明天 09:00-12:00' },
  { value: 'day1-pm', label: '明天 14:00-18:00' },
  { value: 'day2-am', label: '后天 09:00-12:00' },
  { value: 'day2-pm', label: '后天 14:00-18:00' },
]

export const GOLD_SOURCES: TabItem[] = [
  { value: 'self', label: '自购' },
  { value: 'gift', label: '他人赠与' },
  { value: 'activity', label: '活动获得' },
]

/** 首期仅邮寄回收，运保费规则与寄件页共用一份文案 */
export const SHIPPING_RULES: RuleSection[] = [
  {
    key: 'freight',
    title: '① 运费说明',
    items: [
      '邮寄回收过程中运费按固定标准收取：广东省内 18 元/单，省外 23 元/单。',
      '保价金额为您预估回收金额的千分之一，确认下单即认可该标准，双方按此标准结算。',
    ],
  },
  {
    key: 'concept',
    title: '② 概念解释',
    items: [
      '运费：指快递运输过程中产生的费用。',
      '保险费：指为确保快递运输过程中的安全，针对可能发生的丢失、损坏等风险，向快递公司支付的一定保险费用。',
    ],
    note: '寄出时按用户填写的预估克重上保，最终按检测后的实际克重为准。',
  },
  {
    key: 'bear',
    title: '③ 运保费承担规则',
    table: {
      columns: [
        { key: 'weight', label: '克重标准' },
        { key: 'deal', label: '成交' },
        { key: 'return', label: '退货' },
      ],
      rows: [
        { weight: '检测后克重 ≥ 20 克', deal: '平台承担', return: '用户承担' },
        { weight: '检测后克重 < 20 克', deal: '用户承担', return: '用户承担' },
      ],
    },
  },
]
