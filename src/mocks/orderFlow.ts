import type { ChoiceOption } from '@/components/ChoiceGroup'
import { readSession, removeSession, writeSession } from './storage'

export interface ItemPhotoDraft {
  overall: string[]
  mark: string[]
  detail: string[]
}

export interface ShippingSnapshot {
  name: string
  phone: string
  region: string
  detail: string
  courier: string
  pickup: string
  insuredAmount: number | null
  insuranceFee: number | null
  confirmedAt: string
}

export interface OrderDraft {
  category: string
  weight: string
  purity: string
  quantity: number
  defects: string
  brand: string
  spec: string
  certificate: string
  photos: ItemPhotoDraft
  fromQuote: boolean
  /** 已带入的估价快照时间，避免返回本页时覆盖用户修改 */
  quoteSnapshotAt: number
  source: string
  sourceNote: string
  sourceConfirmedAt: string
  serviceAgreed: boolean
  insuranceRuleAgreed: boolean
  agreementsConfirmedAt: string
  destructiveAuthorized: boolean
  destructiveConfirmedAt: string
  shipping: ShippingSnapshot | null
}

const DRAFT_KEY = 'gold-recycling.order-draft'

function emptyDraft(): OrderDraft {
  return {
    category: '',
    weight: '',
    purity: '999',
    quantity: 1,
    defects: '',
    brand: '',
    spec: '',
    certificate: '',
    photos: { overall: [], mark: [], detail: [] },
    fromQuote: false,
    quoteSnapshotAt: 0,
    source: '',
    sourceNote: '',
    sourceConfirmedAt: '',
    serviceAgreed: false,
    insuranceRuleAgreed: false,
    agreementsConfirmedAt: '',
    destructiveAuthorized: false,
    destructiveConfirmedAt: '',
    shipping: null,
  }
}

export function readOrderDraft(): OrderDraft {
  const empty = emptyDraft()
  const stored = readSession<Partial<OrderDraft>>(DRAFT_KEY)
  if (!stored) return empty

  return {
    ...empty,
    ...stored,
    photos: { ...empty.photos, ...(stored.photos ?? {}) },
    shipping: stored.shipping ?? null,
  }
}

export function writeOrderDraft(patch: Partial<OrderDraft>) {
  writeSession(DRAFT_KEY, { ...readOrderDraft(), ...patch })
}

export function resetOrderDraft() {
  removeSession(DRAFT_KEY)
}

export interface ItemCategoryOption {
  value: string
  label: string
  description?: string
  supported: boolean
  blockReason?: string
}

/** P-08 唯一物品信息入口：不支持的品类可直接点选，用于就地拦截演示 */
export const ITEM_CATEGORIES: ItemCategoryOption[] = [
  {
    value: 'jewelry',
    label: '足金首饰',
    description: '项链、手镯、戒指、吊坠等',
    supported: true,
  },
  {
    value: 'bar',
    label: '投资金条 / 金币',
    description: '银行或品牌投资金条、投资金币',
    supported: true,
  },
  {
    value: 'kGold',
    label: 'K 金 / 彩金',
    description: '18K、14K 等非足金饰品',
    supported: false,
    blockReason:
      'K 金含金量低于足金，暂不回收。请勿寄出，误寄将被拒收并退回，往返运费按规则承担。',
  },
  {
    value: 'inlaid',
    label: '镶嵌类首饰',
    description: '镶宝石、玉石或珐琅的饰品',
    supported: false,
    blockReason:
      '镶嵌类无法按足金可熔重量计价，暂不回收。请勿寄出，误寄将被拒收并退回。',
  },
  {
    value: 'mixed',
    label: '含非金配件',
    description: '带皮绳、合金扣等非金配件',
    supported: false,
    blockReason: '含非金配件的饰品暂不回收，请先拆除非金配件后重新评估。',
  },
]

export function findItemCategory(value: string) {
  return ITEM_CATEGORIES.find((item) => item.value === value)
}

export const CERTIFICATE_OPTIONS: ChoiceOption[] = [
  { value: 'with', label: '有证书 / 质保卡', description: '可随寄证书或质保卡' },
  { value: 'without', label: '无证书', description: '不影响回收，按实物检测' },
  { value: 'unknown', label: '不确定', description: '可在寄件前再确认' },
]

export const SOURCE_OPTIONS: ChoiceOption[] = [
  { value: 'self', label: '本人购买', description: '本人购买或自有' },
  { value: 'gift', label: '亲友赠与', description: '亲友赠送' },
  { value: 'inherit', label: '继承所得', description: '继承或受遗赠' },
  { value: 'other', label: '其他合法来源', description: '请在补充说明中描述' },
]

export const DECLARATION_VERSION = '合法来源声明 v1.3'

export const SOURCE_DECLARATION =
  '本人保证所出售黄金来源合法，系本人有权处分的财产，不存在盗窃、抢劫、诈骗等违法情形；如因来源不实产生纠纷，本人愿意承担相应法律责任，并配合平台依法处理。'

export const AGREEMENT_VERSIONS = {
  service: 'v1.3',
  protection: 'v1.3',
  source: DECLARATION_VERSION,
  destructive: 'v1.3',
}

export function sourceLabel(value: string) {
  return SOURCE_OPTIONS.find((item) => item.value === value)?.label ?? '未选择'
}
