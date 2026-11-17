import { BrandMark, Button, Card, DetailPage, FormField, ResultStatus, Toast } from '@/components'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
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
  const [errors, setErrors] = useState<{ name?: string; idNo?: string }>({})
  const [toast, setToast] = useState<string | null>(null)

  const nameValid = name.trim().length >= 2
  const idValid = /^\d{17}[\dXx]$/.test(idNo.trim())

  const handleSubmit = () => {
    const next = {
      name: nameValid ? undefined : '请输入真实姓名（至少 2 个字符）',
      idNo: idValid ? undefined : '请输入正确的 18 位身份证号',
    }
    setErrors(next)
    if (next.name || next.idNo) return

    setSubmitting(true)
    setTimeout(() => {
      try {
        submitRealNameAuth(name.trim(), idNo.trim().toUpperCase())
        setToast('实名认证成功')
        setTimeout(onBack, 800)
      } catch (err) {
        setToast(err instanceof Error ? err.message : '提交失败')
      } finally {
        setSubmitting(false)
      }
    }, 600)
  }

  return (
    <DetailPage
      title="实名认证"
      footer={
        <Button size="lg" block loading={submitting} onClick={handleSubmit}>
          提交认证
        </Button>
      }
    >
      <Card padding="md">
        <div className="flex items-start gap-3">
          <BrandMark icon={ShieldCheck} size="sm" />
          <div className="min-w-0 flex-1">
            <h2 className="text-card-title text-foreground">为什么要实名认证</h2>
            <p className="mt-1 text-caption text-subtle-foreground">监管要求 · 安全交易</p>
          </div>
        </div>
        <p className="mt-3 text-body leading-relaxed text-muted-foreground">
          根据《贵金属和宝石从业机构反洗钱管理办法》及《移动互联网应用程序信息服务管理规定》，
          贵金属交易需履行反洗钱义务，按“后台实名、前台自愿”原则，对您进行真实身份信息核验。
        </p>
      </Card>

      <Card padding="md">
        <h2 className="mb-4 text-card-title text-foreground">填写实名信息</h2>
        <div className="space-y-4">
          <FormField
            label="真实姓名"
            placeholder="请输入身份证上的姓名"
            value={name}
            onChange={(value) => {
              setName(value)
              setErrors((prev) => ({ ...prev, name: undefined }))
            }}
            maxLength={20}
            autoComplete="name"
            required
            disabled={submitting}
            error={errors.name}
          />
          <FormField
            label="身份证号"
            placeholder="请输入 18 位身份证号"
            value={idNo}
            onChange={(value) => {
              setIdNo(value.toUpperCase())
              setErrors((prev) => ({ ...prev, idNo: undefined }))
            }}
            maxLength={18}
            inputMode="text"
            autoComplete="off"
            required
            disabled={submitting}
            error={errors.idNo}
            hint="信息仅用于身份核验，加密存储，不会对外展示"
          />
        </div>
      </Card>

      <Toast open={toast !== null} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}

/** 已实名结果页 */
function VerifiedPage({ onBack }: { onBack: () => void }) {
  return (
    <DetailPage
      title="实名认证"
      footer={
        <Button size="lg" block onClick={onBack}>
          返回
        </Button>
      }
    >
      <Card padding="md" className="py-8">
        <ResultStatus
          status="success"
          title="您已完成实名认证"
          description="若需修改实名信息，请联系客服"
        />
      </Card>
    </DetailPage>
  )
}
