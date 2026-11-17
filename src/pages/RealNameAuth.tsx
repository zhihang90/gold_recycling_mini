import { Button, Card, FormField, PageShell, PageHeader, Toast } from '@/components'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Fingerprint, ShieldCheck } from 'lucide-react'
import { isMemberVerified, readMember, submitRealNameAuth } from '@/mocks/member'

/** 实名认证页（单页面） */
export function RealNameAuthPage() {
  const navigate = useNavigate()
  const member = readMember()

  if (member && isMemberVerified(member)) {
    return <VerifiedPage onBack={() => navigate(-1)} />
  }
  return <AuthFlow onBack={() => navigate(-1)} />
}

function AuthFlow({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('')
  const [idNo, setIdNo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const canSubmit =
    !submitting && name.trim().length >= 2 && /^\d{17}[\dXx]$/.test(idNo.trim())

  const handleSubmit = () => {
    setError(null)
    if (!name.trim() || name.trim().length < 2) {
      setError('请输入真实姓名（至少 2 个字符）')
      return
    }
    if (!/^\d{17}[\dXx]$/.test(idNo.trim())) {
      setError('请输入正确的 18 位身份证号')
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      try {
        submitRealNameAuth(name.trim(), idNo.trim().toUpperCase())
        setToast('实名认证成功')
        setTimeout(onBack, 800)
      } catch (err) {
        setError(err instanceof Error ? err.message : '提交失败')
      } finally {
        setSubmitting(false)
      }
    }, 600)
  }

  return (
    <PageShell padded>
      <PageHeader title="实名认证" />

      {/* 法规说明 */}
      <Card className="mt-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
            <ShieldCheck size={20} strokeWidth={2} />
          </span>
          <div>
            <p className="text-body-strong text-foreground">为什么要实名认证</p>
            <p className="text-caption text-subtle-foreground">监管要求 · 安全交易</p>
          </div>
        </div>
        <p className="mt-4 text-body leading-relaxed text-foreground/90">
          根据《贵金属和宝石从业机构反洗钱管理办法》及《移动互联网应用程序信息服务管理规定》，
          贵金属交易需履行反洗钱义务，按"后台实名、前台自愿"原则，对您进行真实身份信息核验。
        </p>
      </Card>

      {/* 实名信息录入 */}
      <Card className="mt-4 p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Fingerprint size={15} className="text-gold-700" />
          <p className="text-label text-foreground">填写实名信息</p>
        </div>
        <div className="px-4 pb-4 pt-4">
          <FormField
            label="真实姓名"
            placeholder="请输入身份证上的姓名"
            value={name}
            onChange={setName}
            maxLength={20}
            disabled={submitting}
            className="mb-5"
          />
          <FormField
            label="身份证号"
            placeholder="请输入 18 位身份证号"
            value={idNo}
            onChange={(v) => setIdNo(v.toUpperCase())}
            maxLength={18}
            inputMode="text"
            disabled={submitting}
            error={error ?? undefined}
          />
          <p className="mt-3 text-caption text-subtle-foreground">
            信息仅用于身份核验，加密存储，不会对外展示
          </p>
        </div>
      </Card>

      {/* 提交 */}
      <div className="mt-8 pb-[max(16px,env(safe-area-inset-bottom))]">
        <Button
          block
          className="h-11 rounded-full bg-gold-800 text-gold-50"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {submitting ? '提交中…' : '提交认证'}
        </Button>
      </div>

      <Toast open={toast !== null} message={toast ?? ''} onClose={() => setToast(null)} />
    </PageShell>
  )
}

/** 已实名结果页 */
function VerifiedPage({ onBack }: { onBack: () => void }) {
  return (
    <PageShell padded>
      <PageHeader title="实名认证" />
      <Card className="mt-2">
        <div className="py-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
            <ShieldCheck size={32} strokeWidth={1.8} />
          </div>
          <p className="text-body-strong text-foreground">您已完成实名认证</p>
          <p className="mt-1 text-caption text-subtle-foreground">
            若需修改实名信息，请联系客服
          </p>
        </div>
      </Card>
      <div className="mt-6">
        <Button block className="rounded-full" onClick={onBack}>
          返回
        </Button>
      </div>
    </PageShell>
  )
}
