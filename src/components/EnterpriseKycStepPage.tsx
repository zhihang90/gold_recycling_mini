import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ENTERPRISE_KYC_STEPS, type EnterpriseStepKey } from '@/hooks/useEnterpriseKyc'
import { Button } from './Button'
import { DetailPage } from './DetailPage'
import { StepProgress } from './StepProgress'

interface EnterpriseKycStepPageProps {
  step: EnterpriseStepKey
  completedIndices: number[]
  children: ReactNode
  /** 默认取前一步；基本信息页等特殊返回目标可显式指定 */
  previousPath?: string
  nextDisabled?: boolean
  /** 缺省跳转下一步；需要弹窗或其他业务动作时由页面覆写 */
  onNext?: () => void
  onBack?: () => void
  /** 缺省为“上一步 / 保存并下一步”；传 null 可关闭，传节点可整体覆写 */
  footer?: ReactNode | null
  /** 结果页使用：允许当前步骤也展示已完成勾选 */
  showCurrentCompleted?: boolean
}

/** 企业 KYC 步骤页骨架：统一标题、进度条与默认底部导航，业务状态仍由各步骤页管理。 */
export function EnterpriseKycStepPage({
  step,
  completedIndices,
  children,
  previousPath,
  nextDisabled = false,
  onNext,
  onBack,
  footer,
  showCurrentCompleted = false,
}: EnterpriseKycStepPageProps) {
  const navigate = useNavigate()
  const currentIndex = ENTERPRISE_KYC_STEPS.findIndex((item) => item.key === step)
  // 只勾选当前步骤之前的已完成项，避免停留在前面步骤时后面步骤提前打钩
  const visibleCompleted = showCurrentCompleted
    ? completedIndices
    : completedIndices.filter((i) => i < currentIndex)
  const prevPath = previousPath ?? ENTERPRISE_KYC_STEPS[currentIndex - 1]?.path
  const nextPath = ENTERPRISE_KYC_STEPS[currentIndex + 1]?.path

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else if (nextPath) {
      navigate(nextPath)
    }
  }

  const defaultFooter = (
    <div className="flex gap-3">
      <Button
        variant="tertiary"
        size="lg"
        className="flex-1"
        onClick={() => (prevPath ? navigate(prevPath) : navigate(-1))}
      >
        上一步
      </Button>
      <Button size="lg" className="flex-[2]" onClick={handleNext} disabled={nextDisabled}>
        保存并下一步
      </Button>
    </div>
  )

  return (
    <DetailPage
      title="企业实名认证"
      onBack={onBack}
      stickyBar={
        <StepProgress
          steps={[...ENTERPRISE_KYC_STEPS]}
          currentIndex={currentIndex}
          completedIndices={visibleCompleted}
        />
      }
      footer={footer === undefined ? defaultFooter : footer}
    >
      {children}
    </DetailPage>
  )
}
