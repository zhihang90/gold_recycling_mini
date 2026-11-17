import type { RuleSection } from '@/components/RuleSheet'

/** 协议版本号：与页面展示保持一致，统一在此维护 */
export const RULE_VERSION = 'v1.3'

/** 首页「回收规则」摘要：与下单页引用同一口径，未定项不写承诺 */
export const HOME_RULE_SUMMARY: RuleSection[] = [
  {
    key: 'category',
    title: '品类范围',
    items: [
      '支持足金首饰、投资金条与投资金币。',
      'K 金、镶嵌类、含非金配件暂不回收；误寄将被拒收退回。',
    ],
  },
  {
    key: 'price',
    title: '金价与费用',
    items: [
      '页面展示的是参考回收金价，不是最终结算价。',
      '服务费、运保费与保价费以订单协议为准。',
    ],
  },
  {
    key: 'assay',
    title: '破检与终价',
    items: [
      '检测为破坏性检测，检测后品相不可还原。',
      '最终按检测结果与检测时点金价结算，终价需您在 30 分钟内确认。',
    ],
  },
  {
    key: 'return',
    title: '退回与直播',
    items: [
      '不接受终价可申请退回，退回费用与时限以协议为准。',
      '检测全程直播，录像保存 3 年。',
    ],
  },
]

export const SERVICE_AGREEMENT_RULES: RuleSection[] = [
  {
    key: 'service',
    title: '一、服务内容',
    items: [
      '平台提供在线估价、寄件回收、检测、报价确认与结算进度查询。',
      '在线估价仅供参考，不构成最终成交价。',
    ],
  },
  {
    key: 'ship',
    title: '二、寄件与保价',
    items: [
      '寄件需按平台要求完成强制保价。',
      '保价未确认或校验失败时，订单无法提交。',
    ],
  },
  {
    key: 'assay',
    title: '三、检测与终价',
    items: [
      '检测为破坏性检测，检测后品相不可还原。',
      '最终金额以检测结果与检测时点金价为基准。',
    ],
  },
  {
    key: 'return',
    title: '四、退回与结算',
    items: ['不接受终价可申请退回，退回费用与时限以平台规则为准。'],
  },
]

export const PRICE_PROTECTION_RULES: RuleSection[] = [
  {
    key: 'amount',
    title: '保价金额',
    items: ['按您的预估回收货值投保，最终以实际寄件申报价值为准。'],
  },
  {
    key: 'fee',
    title: '保价费',
    items: ['保价费按保价金额的 0.1% 计收。'],
  },
  {
    key: 'base',
    title: '赔付基数与免责条件',
    items: ['赔付基数与免责条件以协议为准。'],
  },
  {
    key: 'time',
    title: '处理时限',
    items: ['丢失或损坏的处理时限以协议为准。'],
  },
  {
    key: 'notice',
    title: '重要提示',
    items: [
      '未确认保价或保价校验失败时，订单不得提交。',
      '请勿自行额外保价，平台统一投保。',
    ],
  },
]

export const DESTRUCTIVE_AUTHORIZATION_RULES: RuleSection[] = [
  {
    key: 'scope',
    title: '授权范围',
    items: ['对实物进行称重、拍照、熔炼与纯度检测。'],
  },
  {
    key: 'restore',
    title: '不可还原',
    items: ['检测后品相不可还原，无法恢复原状。'],
  },
  {
    key: 'result',
    title: '检测结果',
    items: [
      '检测结果以平台出具的检测报告为准。',
      '最终按检测结果与检测时点金价结算。',
    ],
  },
  {
    key: 'live',
    title: '直播与录像',
    items: ['检测全程直播，录像保存 3 年。'],
    note: '本授权需单独勾选并单独确认，不与其他协议合并。',
  },
]

/** 破检授权确认弹层的要点，与上方规则同一口径 */
export const DESTRUCTIVE_CONFIRM_POINTS = [
  '同意对实物进行称重、拍照、熔炼与纯度检测；',
  '知悉检测后品相不可还原；',
  '知悉最终按检测结果与检测时点金价结算。',
]
