import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ENTERPRISE_TYPES,
  EnterpriseKyc,
  KycStatus,
  emptyEnterpriseKyc,
  getEnterpriseAuthStatus,
  readEnterpriseKyc,
  readMember,
  saveEnterpriseKycDraft,
  submitEnterpriseKyc,
  withEnterpriseMock,
} from '@/mocks/member'
import { routePath } from '@/routes/paths'

/**
 * 企业 KYC 流程：4 个业务步骤 + 1 个结果节点
 *   ① 企业基本信息（OCR + 证件）→
 *   ② 人脸识别（独立路由 /me/enterprise/face）→
 *   ③ 对公账户填写 →
 *   ④ 对公打款验证 → 完成后自动提交
 *   ⑤ 认证成功（结果节点，不是表单步骤）
 *
 * 注：step ② 人脸识别 已有独立路由 /me/enterprise/face（EnterpriseFaceVerify），
 *     与个人实名人脸页 /me/auth/face 分离，避免路由与状态耦合。
 */
export const ENTERPRISE_KYC_STEPS = [
  { key: 'base-info', title: '企业信息', path: routePath('me.enterprise.base-info') },
  { key: 'face', title: '人脸识别', path: routePath('me.enterprise.face') },
  { key: 'bank-account', title: '对公账户', path: routePath('me.enterprise.bank') },
  { key: 'bank-verify', title: '打款验证', path: routePath('me.enterprise.bankVerify') },
  { key: 'submit', title: '认证成功', path: routePath('me.enterprise.status') },
] as const

export type EnterpriseStepKey = (typeof ENTERPRISE_KYC_STEPS)[number]['key']

/** 校验各步骤是否完成（全在前端做，mock 无需调后端） */
export function validateBaseInfo(data: EnterpriseKyc): boolean {
  const b = data.baseInfo
  const l = data.legal
  return Boolean(
    // 企业基本信息（OCR 自动识别）
    b.companyName?.trim() &&
    b.creditCode?.trim() &&
    b.legalName?.trim() &&
    b.legalIdNo?.trim() &&
    b.legalPhone?.trim() &&
    data.license.front.length > 0 &&
    // 法人证件材料
    l.idFront.length > 0 &&
    l.idBack.length > 0 &&
    l.holdPhoto.length > 0,
  )
}

/** 人脸识别独立步骤的校验（仅 validateStep 内部使用） */
function validateFaceStep(data: EnterpriseKyc): boolean {
  return !!data.legal.faceVerified
}

export function validateBankAccount(data: EnterpriseKyc): boolean {
  const b = data.bank
  return Boolean(b.bankName?.trim() && b.accountNo?.trim())
}
export function validateBankVerify(data: EnterpriseKyc): boolean {
  return data.bank.verifyStatus === 'verified'
}
export function validateAgreements(data: EnterpriseKyc): boolean {
  const a = data.agreements
  return Boolean(a.customerId && a.aml && a.privacy)
}

export function validateStep(step: EnterpriseStepKey, data: EnterpriseKyc): boolean {
  switch (step) {
    case 'base-info':
      return validateBaseInfo(data)
    case 'face':
      return validateFaceStep(data)
    case 'bank-account':
      return validateBankAccount(data)
    case 'bank-verify':
      return validateBankVerify(data)
    case 'submit':
      return validateAgreements(data)
  }
}

/** 哪个步骤第一个未完成 */
export function findNextStep(data: EnterpriseKyc): EnterpriseStepKey {
  for (const s of ENTERPRISE_KYC_STEPS) {
    if (!validateStep(s.key, data)) return s.key
  }
  return 'submit' // 全部完成 → 停在提交页
}

/** 已完成步骤的 index 数组（0-based）：按顺序推进，前一步未完成时后续步骤不算完成 */
export function getCompletedIndices(data: EnterpriseKyc): number[] {
  const out: number[] = []
  for (let i = 0; i < ENTERPRISE_KYC_STEPS.length; i += 1) {
    if (!validateStep(ENTERPRISE_KYC_STEPS[i].key, data)) break
    out.push(i)
  }
  return out
}

/**
 * 共享 hook：管理企业 KYC 草稿的读写、保存、提交
 * @param options.seedMock 步骤页直接进入时用 mock 补齐空白区块，便于免填表预览；保存后才会写入草稿
 */
export function useEnterpriseKyc(options?: { seedMock?: boolean }) {
  const member = readMember()
  const enterpriseStatus = getEnterpriseAuthStatus(member)
  const storedStatus =
    enterpriseStatus === 'unstarted' || enterpriseStatus === 'draft' ? null : enterpriseStatus
  const [draft, setDraft] = useState<EnterpriseKyc>(() => {
    const stored = readEnterpriseKyc()
    return options?.seedMock ? withEnterpriseMock(stored) : (stored ?? emptyEnterpriseKyc())
  })
  const [submitted, setSubmitted] = useState<KycStatus | null>(storedStatus)

  // 草稿不是提交结果；同步 member 里的正式审核状态（可能被别处改动）
  useEffect(() => {
    setSubmitted(storedStatus)
  }, [storedStatus])

  /** 保存草稿（任何步骤改动后都自动调用） */
  const save = useCallback((patch?: Partial<EnterpriseKyc>) => {
    setDraft((prev) => {
      const next = patch ? { ...prev, ...patch } : prev
      saveEnterpriseKycDraft(next)
      return next
    })
  }, [])

  /** 只更新某个子块（baseInfo / license / legal / bank / agreements） */
  const update = useCallback(
    <K extends keyof EnterpriseKyc>(block: K, patch: Partial<EnterpriseKyc[K]>) => {
      setDraft((prev) => {
        const next = { ...prev, [block]: { ...(prev[block] as object), ...patch } } as EnterpriseKyc
        saveEnterpriseKycDraft(next)
        return next
      })
    },
    [],
  )

  const rawCompleted = useMemo(() => getCompletedIndices(draft), [draft])
  /** 进度条展示用：提交步骤只有真正提交成功后才打钩，驳回后也不打钩 */
  const submittedDone = submitted !== null && submitted !== 'rejected'
  const completedIndices = useMemo(
    () =>
      submittedDone
        ? rawCompleted
        : rawCompleted.filter((i) => i < ENTERPRISE_KYC_STEPS.length - 1),
    [rawCompleted, submittedDone],
  )

  /** 提交（从 submit 页触发） */
  const submit = useCallback(() => {
    const result = submitEnterpriseKyc(draft)
    setSubmitted(result.kycStatus ?? null)
    return result
  }, [draft])

  const reset = useCallback(() => {
    const empty = emptyEnterpriseKyc()
    setDraft(empty)
    saveEnterpriseKycDraft(empty)
    setSubmitted(null)
  }, [])

  return {
    member,
    draft,
    submitted,
    save,
    update,
    submit,
    reset,
    completedIndices,
  }
}

export { ENTERPRISE_TYPES }
