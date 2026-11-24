import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ScanFace } from 'lucide-react'

import { EnterpriseKycStepPage, Toast } from '@/components'
import { cn } from '@/lib/utils'
import { getCompletedIndices, useEnterpriseKyc } from '@/hooks/useEnterpriseKyc'
import { readMember, saveEnterpriseKycDraft } from '@/mocks/member'
import { paths } from '@/routes/paths'

const STEPS = ['正对屏幕', '张张嘴', '点点头'] as const

type Stage = 'scanning' | 'success'

/**
 * 企业法人独立人脸识别页：
 *   - 专属路由 /me/enterprise/face（与个人 /me/auth/face 分离）
 *   - 顶部带企业 KYC 5 步进度条，当前高亮第 2 步
 *   - 核验成功自动写回 enterpriseKyc.legal.faceVerified=true
 *   - 默认完成后跳转到下一个企业 KYC 步骤（对公账户）
 */
export function EnterpriseFaceVerifyPage() {
  const navigate = useNavigate()
  const { draft } = useEnterpriseKyc({ seedMock: true })
  const [stage, setStage] = useState<Stage>('scanning')
  const [step, setStep] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  // 企业认证仅要求登录，不依赖个人实名认证
  useEffect(() => {
    if (!readMember()) {
      navigate(paths.login, { replace: true })
    }
  }, [navigate])

  // 进入即开始动作流（模拟活体检测）
  useEffect(() => {
    const timers: number[] = []
    const at = (fn: () => void, delay: number) => {
      timers.push(window.setTimeout(fn, delay))
    }

    at(() => setStep(1), 1600)
    at(() => setStep(2), 3400)
    at(() => {
      try {
        // 写回 enterprise KYC：人脸识别通过
        const updated = saveEnterpriseKycDraft({
          ...draft,
          legal: { ...draft.legal, faceVerified: true, faceScore: 96 },
        })
        void updated
        setStage('success')
        setToast('认证成功')
        // 自动跳转到下一个企业 KYC 步骤
        at(() => navigate(paths.meEnterpriseStepBank, { replace: true }), 1400)
      } catch (err) {
        setToast(err instanceof Error ? err.message : '认证失败，请重试')
      }
    }, 5200)

    return () => timers.forEach((id) => window.clearTimeout(id))
    // 只在 mount 跑一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 已完成进度：识别进行中时只展示人脸之前的步骤，避免后面步骤被提前打钩
  const completedIndices = getCompletedIndices(draft)
  const effectiveCompleted =
    stage === 'success' ? completedIndices : completedIndices.filter((i) => i < 1)

  return (
    <EnterpriseKycStepPage
      step="face"
      completedIndices={effectiveCompleted}
      footer={null}
      onBack={() => navigate(-1)}
    >
      <div className="flex items-center justify-between text-caption text-subtle-foreground">
        <span>第 2 步 · 共 5 步</span>
        <span>法人人脸识别</span>
      </div>

      <div className="relative mx-auto aspect-3/4 w-full max-w-72 overflow-hidden rounded-lg bg-ink-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'flex h-56 w-44 items-center justify-center rounded-full border-2 border-dashed border-paper/50',
              stage === 'scanning' && 'animate-pulse',
            )}
          >
            <ScanFace size={64} strokeWidth={1.2} className="text-paper/40" aria-hidden="true" />
          </div>
        </div>

        {stage === 'scanning' ? (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900 via-ink-900/85 to-transparent px-4 pb-6 pt-12 text-center">
            <p className="text-body-strong text-paper">
              {step === 0 ? '请将法人面部置于框内' : `请${STEPS[step]}`}
            </p>
            <p className="mt-1 text-caption text-paper/70">保持光线充足，面部不要离开识别框</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Check size={30} className="text-primary-foreground" aria-hidden="true" />
            </span>
            <p className="text-body-strong text-paper">识别成功</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-8">
        {STEPS.map((label, index) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-caption',
                index <= step || stage === 'success'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-2 text-subtle-foreground',
              )}
            >
              {index < step || stage === 'success' ? (
                <Check size={14} aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                'text-caption',
                index === step && stage === 'scanning'
                  ? 'text-foreground'
                  : 'text-subtle-foreground',
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <Toast open={toast !== null} message={toast ?? ''} onClose={() => setToast(null)} />
    </EnterpriseKycStepPage>
  )
}
