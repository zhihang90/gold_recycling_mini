import { STORAGE_KEYS } from './keys'
import { readSession, writeSession } from './storage'

export interface BankAccount {
  id: string
  /** 开户人，来自实名认证信息 */
  holder: string
  /** 纯数字卡号，展示统一走 maskCardNo / tailNo */
  cardNo: string
  bank: string
  /** 开户城市，如「广东 深圳」 */
  city: string
  /** 默认收款账户：新增的首张卡自动成为默认 */
  isDefault: boolean
}

/** 业务规则：单个用户最多绑定 5 张银行卡 */
export const MAX_BANK_ACCOUNTS = 5

/** 首期默认账户：与回收订单详情中的收款账号保持一致 */
const SEED_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-pingan',
    holder: '张三',
    cardNo: '6225380067119455',
    bank: '平安银行',
    city: '广东 深圳',
    isDefault: true,
  },
]

export function readBankAccounts(): BankAccount[] {
  const stored = readSession<BankAccount[]>(STORAGE_KEYS.BANK_ACCOUNTS)
  return Array.isArray(stored) ? stored : SEED_ACCOUNTS
}

export function writeBankAccounts(accounts: BankAccount[]) {
  writeSession(STORAGE_KEYS.BANK_ACCOUNTS, accounts)
}

/** 按卡号前 6 位识别发卡行；识别不到时返回空串，交由用户手动填写 */
const BIN_RULES: { prefix: string; bank: string }[] = [
  { prefix: '622538', bank: '平安银行' },
  { prefix: '622155', bank: '平安银行' },
  { prefix: '622202', bank: '中国工商银行' },
  { prefix: '622200', bank: '中国工商银行' },
  { prefix: '622208', bank: '中国工商银行' },
  { prefix: '621226', bank: '中国工商银行' },
  { prefix: '622848', bank: '中国农业银行' },
  { prefix: '622845', bank: '中国农业银行' },
  { prefix: '622846', bank: '中国农业银行' },
  { prefix: '622700', bank: '中国建设银行' },
  { prefix: '621700', bank: '中国建设银行' },
  { prefix: '622588', bank: '招商银行' },
  { prefix: '621483', bank: '招商银行' },
  { prefix: '622262', bank: '交通银行' },
  { prefix: '621661', bank: '中国银行' },
  { prefix: '621660', bank: '中国银行' },
  { prefix: '621691', bank: '中国民生银行' },
  { prefix: '622622', bank: '中国民生银行' },
  { prefix: '622909', bank: '兴业银行' },
  { prefix: '621792', bank: '上海浦东发展银行' },
  { prefix: '622568', bank: '广发银行' },
  { prefix: '621299', bank: '华夏银行' },
  { prefix: '622150', bank: '中国邮政银行' },
  { prefix: '622188', bank: '中国邮政银行' },
  { prefix: '622660', bank: '中国光大银行' },
  { prefix: '622986', bank: '恒丰银行' },
]

export function detectBank(cardNo: string) {
  const digits = cardNo.replace(/\D/g, '')
  if (digits.length < 6) return ''
  return BIN_RULES.find((rule) => digits.startsWith(rule.prefix))?.bank ?? ''
}

/** 每 4 位补一个空格，便于输入时核对 */
export function formatCardNo(cardNo: string) {
  return cardNo
    .replace(/\D/g, '')
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()
}

export function tailNo(cardNo: string) {
  return cardNo.replace(/\D/g, '').slice(-4)
}

/** 列表展示：**** **** **** 9455 */
export function maskCardNo(cardNo: string) {
  return `**** **** **** ${tailNo(cardNo)}`
}

export function addBankAccount(input: {
  holder: string
  cardNo: string
  bank: string
  city: string
}): BankAccount {
  const accounts = readBankAccounts()
  const account: BankAccount = {
    id: `bank-${Date.now()}`,
    holder: input.holder,
    cardNo: input.cardNo.replace(/\D/g, ''),
    bank: input.bank,
    city: input.city,
    isDefault: accounts.length === 0,
  }
  writeBankAccounts([...accounts, account])
  return account
}

/** 删除账户：删掉默认卡后，把列表首张提升为默认，避免出现无默认卡 */
export function removeBankAccount(id: string) {
  const accounts = readBankAccounts()
  const next = accounts.filter((account) => account.id !== id)
  if (next.length > 0 && !next.some((account) => account.isDefault)) {
    next[0] = { ...next[0], isDefault: true }
  }
  writeBankAccounts(next)
}

export function setDefaultBankAccount(id: string) {
  writeBankAccounts(
    readBankAccounts().map((account) => ({ ...account, isDefault: account.id === id })),
  )
}

/** 添加页推荐银行；点击后直接填入银行名称 */
export const RECOMMENDED_BANKS = [
  '中国建设银行',
  '中国工商银行',
  '中国农业银行',
  '中国邮政银行',
  '中国交通银行',
  '中国银行',
  '中国光大银行',
  '华夏银行',
  '中国民生银行',
  '兴业银行',
  '上海浦东发展银行',
  '广发银行',
  '招商银行',
  '恒丰银行',
]

/** 开户城市候选；真实数据应来自银行联行号接口 */
export const BANK_CITY_OPTIONS: { value: string; label: string }[] = [
  { value: '广东 深圳', label: '广东 深圳' },
  { value: '广东 广州', label: '广东 广州' },
  { value: '北京', label: '北京' },
  { value: '上海', label: '上海' },
  { value: '浙江 杭州', label: '浙江 杭州' },
  { value: '江苏 南京', label: '江苏 南京' },
  { value: '四川 成都', label: '四川 成都' },
  { value: '湖北 武汉', label: '湖北 武汉' },
]
