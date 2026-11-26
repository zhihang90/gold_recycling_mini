import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Button,
  Card,
  DetailPage,
  EmptyState,
  EnterpriseKycStepPage,
  FormField,
  InlineNotice,
  Toast,
} from '@/components'
import { useEnterpriseKyc } from '@/hooks/useEnterpriseKyc'
import { loginRedirectState, paths } from '@/routes/paths'

export function EnterpriseStepBankPage() {
  const navigate = useNavigate()
  const { member, draft, update, save, completedIndices } = useEnterpriseKyc({ seedMock: true })
  const [toast, setToast] = useState<string | null>(null)

  if (!member) {
    return (
      <DetailPage title="企业认证">
        <div className="px-4 pt-10">
          <EmptyState
            icon={ShieldCheck}
            title="请先登录"
            description="登录后可直接进行企业实名认证，无需先完成个人实名。"
            action={
              <Button onClick={() => navigate(paths.login, { state: loginRedirectState() })}>
                去登录
              </Button>
            }
          />
        </div>
      </DetailPage>
    )
  }

  const b = draft.bank

  return (
    <>
      <EnterpriseKycStepPage
        step="bank-account"
        completedIndices={completedIndices}
        previousPath={paths.meEnterpriseStepBaseInfo}
        onNext={() => {
          if (!b.bankName?.trim()) {
            setToast('请填写开户行')
            return
          }
          if (!b.accountNo?.trim()) {
            setToast('请填写对公银行账号')
            return
          }
          save()
          navigate(paths.meEnterpriseBankVerify)
        }}
      >
        <InlineNotice tone="info">
          <p className="text-caption text-muted-foreground">
            请填写企业对公账户信息，用于后续对公打款验证。
          </p>
        </InlineNotice>

        <Card padding="lg" className="space-y-3">
          <FormField
            label="开户行"
            required
            value={b.bankName}
            placeholder="例如：招商银行深圳分行"
            onChange={(v) => update('bank', { bankName: v })}
          />
          <FormField
            label="对公银行账号"
            required
            value={b.accountNo}
            placeholder="请输入对公账户完整账号"
            inputMode="numeric"
            onChange={(v) => update('bank', { accountNo: v.replace(/\s/g, '') })}
          />
        </Card>
      </EnterpriseKycStepPage>

      <Toast open={!!toast} message={toast ?? ''} onClose={() => setToast(null)} />
    </>
  )
}
