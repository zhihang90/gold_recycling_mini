import { STORAGE_KEYS } from './keys'
import { readSession, removeSession, writeSession } from './storage'

/** 黄金来源：签署页必选项 */
export interface GoldSourceOption {
  value: string
  label: string
}

export const GOLD_SOURCE_OPTIONS: GoldSourceOption[] = [
  { value: 'personal', label: '个人持有' },
  { value: 'gift', label: '他人赠与' },
  { value: 'activity', label: '活动获得' },
]

/** 协议阅读确认结果：回到下单页后据此回填勾选态 */
export interface AgreementConfirmation {
  /** 黄金来源 value，对应 GOLD_SOURCE_OPTIONS */
  source: string
  agreedAt: number
}

export function saveAgreementConfirmation(confirmation: AgreementConfirmation) {
  writeSession(STORAGE_KEYS.AGREEMENT_CONFIRMATION, confirmation)
}

export function readAgreementConfirmation(): AgreementConfirmation | null {
  const confirmation = readSession<AgreementConfirmation>(STORAGE_KEYS.AGREEMENT_CONFIRMATION)
  return confirmation?.source ? confirmation : null
}

export function clearAgreementConfirmation() {
  removeSession(STORAGE_KEYS.AGREEMENT_CONFIRMATION)
}
