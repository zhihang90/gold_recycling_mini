import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, ScanFace } from 'lucide-react'
import { DetailPage, Toast } from '@/components'
import { cn } from '@/lib/utils'
import {
  clearPendingRealNameAuth,
  readMember,
  readPendingRealNameAuth,
  saveMember,
  submitRealNameAuth,
} from '@/mocks/member'
import { paths } from '@/routes/paths'

const STEPS = ['正对屏幕', '张张嘴', '点点头'] as const

/** 从左侧菜单直达时没有表单暂存，用同一套演示数据兜底 */
const FALLBACK_AUTH = { name: '张三', idNo: '440300199001011234', phone: '13800138000' }

type Stage = 'scanning' | 'success'

/** 个人实名认证人脸识别（企业法人走独立页 /me/enterprise/face） */
export function RealNameAuthFacePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? paths.me
  const [auth] = useState(() => readPendingRealNameAuth() ?? FALLBACK_AUTH)
  const [stage, setStage] = useState<Stage>('scanning')
  const [step, setStep] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const timers: number[] = []
    const at = (fn: () => void, delay: number) => {
      timers.push(window.setTimeout(fn, delay))
    }

    at(() => setStep(1), 1600)
    at(() => setStep(2), 3400)
    at(() => {
      try {
        if (!readMember()) saveMember(auth.phone)
        submitRealNameAuth(auth.name, auth.idNo)
        clearPendingRealNameAuth()

        setStage('success')
        setToast('认证成功')
        at(() => navigate(redirect, { replace: true }), 1400)
      } catch (err) {
        setToast(err instanceof Error ? err.message : '认证失败，请重试')
      }
    }, 5200)

    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [auth, navigate, redirect])

  return (
    <DetailPage title="人脸识别" onBack={() => navigate(-1)}>
      <div className="flex items-center justify-between text-caption text-subtle-foreground">
        <span>实名认证 · 人脸识别</span>
        <span>活体检测中</span>
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
              {step === 0 ? '请将面部置于框内' : `请${STEPS[step]}`}
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
    </DetailPage>
  )
}
