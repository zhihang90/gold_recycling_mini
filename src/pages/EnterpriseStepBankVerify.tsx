import { Landmark, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
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
import { submitEnterpriseKyc, type EnterpriseKyc } from '@/mocks/member'
import { paths } from '@/routes/paths'

/** 打款金额区间（运营在管理平台发起，用户端仅确认收到金额） */
const MIN_AMOUNT = 0.01
const MAX_AMOUNT = 1

function maskAccount(accountNo: string): string {
  const cleaned = accountNo.replace(/\s/g, '')
  if (cleaned.length < 8) return cleaned
  return `${cleaned.slice(0, 4)} **** **** ${cleaned.slice(-4)}`
}

export function EnterpriseStepBankVerifyPage() {
  const navigate = useNavigate()
  const { member, draft, update } = useEnterpriseKyc({ seedMock: true })
  const [toast, setToast] = useState<string | null>(null)
  // 演示：默认带出一笔区间内的金额，免去手填
  const [userAmount, setUserAmount] = useState('0.05')
  const [confirmed, setConfirmed] = useState(false)
  const b = draft.bank

  /** 原型静态页：确认金额即视为认证通过，固定写入完成态再进入认证成功页 */
  const finish = useCallback(() => {
    const finalKyc: EnterpriseKyc = {
      ...draft,
      legal: { ...draft.legal, faceVerified: true },
      bank: { ...draft.bank, verifyStatus: 'verified' },
      agreements: { customerId: true, aml: true, privacy: true },
    }
    try {
      submitEnterpriseKyc(finalKyc)
      navigate(paths.meKycStatus, { replace: true })
    } catch (err) {
      setToast(err instanceof Error ? err.message : '提交失败，请重试')
    }
  }, [draft, navigate])

  // 验证成功写回草稿后，先展示 toast 再自动提交进入结果页（Hook 必须在任何条件返回之前）
  useEffect(() => {
    if (!confirmed) return
    const timer = window.setTimeout(finish, 900)
    return () => window.clearTimeout(timer)
  }, [confirmed, finish])

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

  const handleConfirm = () => {
    const amt = Number.parseFloat(userAmount)
    if (Number.isNaN(amt) || amt < MIN_AMOUNT || amt > MAX_AMOUNT) {
      setToast(`请输入 ¥${MIN_AMOUNT.toFixed(2)}~¥${MAX_AMOUNT.toFixed(2)} 之间的金额`)
      return
    }
    update('bank', { verifyStatus: 'verified' })
    setToast('对公账户已验证通过')
    // 等待草稿写回后再提交，确保使用已验证状态
    setConfirmed(true)
  }

  const footer = (
    <div className="flex gap-3">
      <Button
        variant="tertiary"
        size="lg"
        className="flex-1"
        onClick={() => navigate(paths.meEnterpriseStepBank)}
      >
        上一步
      </Button>
      <Button size="lg" className="flex-[2]" onClick={handleConfirm}>
        确认金额并验证
      </Button>
    </div>
  )

  return (
    <>
      <EnterpriseKycStepPage step="bank-verify" completedIndices={[0, 1, 2]} footer={footer}>
        <InlineNotice tone="info">
          <p className="text-caption text-muted-foreground">
            运营人员已向对公账户打入一笔小额款项（金额大小：¥{MIN_AMOUNT.toFixed(2)}~
            {MAX_AMOUNT.toFixed(2)}），请查收银行流水后输入实际收到金额完成验证。
          </p>
        </InlineNotice>

        <Card padding="lg" className="space-y-3">
          <p className="text-card-title text-foreground flex items-center gap-1">
            <Landmark size={14} /> 验证对公账户信息
          </p>
          <div className="rounded-lg bg-surface-2/50 p-3 space-y-2">
            <div>
              <p className="text-caption text-subtle-foreground">收款账户</p>
              <p className="text-body text-foreground font-medium">
                {draft.baseInfo.companyName || '—'}
              </p>
            </div>
            <div>
              <p className="text-caption text-subtle-foreground">开户行</p>
              <p className="text-body text-foreground font-medium">{b.bankName || '—'}</p>
            </div>
            <div>
              <p className="text-caption text-subtle-foreground">对公账户</p>
              <p className="text-body text-foreground font-medium tracking-wider tabular-nums">
                {b.accountNo ? maskAccount(b.accountNo) : '—'}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg" className="space-y-3">
          <p className="text-card-title text-foreground">输入打款金额</p>
          <p className="text-caption text-muted-foreground">
            系统已打款（金额大小：¥ {MIN_AMOUNT.toFixed(2)}~{MAX_AMOUNT.toFixed(2)}），
            请查收银行流水后输入实际收到的金额
          </p>
          <FormField
            label="实际收到金额"
            required
            placeholder="请输入金额（元）"
            inputMode="decimal"
            value={userAmount}
            trailing="元"
            onChange={setUserAmount}
          />
        </Card>
      </EnterpriseKycStepPage>

      <Toast open={!!toast} message={toast ?? ''} onClose={() => setToast(null)} />
    </>
  )
}
