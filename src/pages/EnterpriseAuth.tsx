import { ShieldCheck } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'

import { Button, DetailPage, EmptyState } from '@/components'
import { ENTERPRISE_KYC_STEPS, findNextStep, useEnterpriseKyc } from '@/hooks/useEnterpriseKyc'
import { paths } from '@/routes/paths'

/**
 * 企业认证 hub：仅做前置校验 + 自动路由到下一步。
 * 具体表单在 EnterpriseStepXxx.tsx（4 个独立全屏步骤页 + 1 个结果页）。
 *
 * 路由跳转规则：
 * - 未登录 → 引导登录
 * - 已提交或已通过企业认证 → /me/kyc/status
 * - 已驳回 → 回到第 1 步修改资料
 * - 其他 → 跳到第一个未完成步骤（base-info → face → bank-account → bank-verify）
 * 打款验证完成后自动提交，第 5 个节点“提交成功”仅作结果展示。
 * 个人实名与企业认证相互独立，均可直接办理。
 */
export function EnterpriseAuthPage() {
  const navigate = useNavigate()
  const { member, draft, submitted } = useEnterpriseKyc()

  if (!member) {
    return (
      <DetailPage title="企业认证">
        <div className="px-4 pt-10">
          <EmptyState
            icon={ShieldCheck}
            title="请先登录"
            description="登录后可直接进行企业实名认证，无需先完成个人实名。"
            action={<Button onClick={() => navigate(paths.login)}>去登录</Button>}
          />
        </div>
      </DetailPage>
    )
  }

  // 已提交审核 → 跳到状态页
  if (submitted && submitted !== 'rejected') {
    return <Navigate to={paths.meKycStatus} replace />
  }

  // 已认证通过 → 跳转
  if (member?.customerType === 'enterprise' && member.kycStatus === 'passed') {
    return <Navigate to={paths.meKycStatus} replace />
  }

  // 已驳回 → 回第 1 步修改资料后重新提交
  if (submitted === 'rejected') {
    return <Navigate to={paths.meEnterpriseStepBaseInfo} replace />
  }

  // 跳到第一个未完成步骤；前 4 步都完成但尚未提交时，回到第 4 步自动提交
  const nextKey = findNextStep(draft)
  if (nextKey === 'submit') {
    return <Navigate to={paths.meEnterpriseBankVerify} replace />
  }
  const target = ENTERPRISE_KYC_STEPS.find((s) => s.key === nextKey)!
  return <Navigate to={target.path} replace />
}
