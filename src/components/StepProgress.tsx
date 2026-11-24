import { Check } from 'lucide-react'

export interface StepItem {
  key: string
  title: string
  /** 小圆点下方补充图标（可选，用于"人脸"、"打款"等有独立含义的节点） */
  icon?: React.ReactNode
  /** hover 气泡提示（可选，不传则使用 title） */
  hint?: string
}

export interface StepProgressProps {
  steps: StepItem[]
  /** 当前步骤 index（0-based） */
  currentIndex: number
  /** 已完成步骤 index 集合（0-based） */
  completedIndices: number[]
  /** 进度条整体可点击切换（演示用） */
  onStepClick?: (index: number, key: string) => void
}

/**
 * 横向步骤进度条：金融/银行风格 + 交互增强。
 *
 * 节点状态：
 *   - ✓ 已完成：金底白勾 + 金色连线 +  hover 时显示"✓ 已完成"
 *   - ● 进行中：金圈高亮 + ring 光圈 + 金色右连线 + hover 放大 tooltip
 *   - ○ 未到达：灰圈 + 灰色连线 + hover 提示"待完成"
 *
 * 交互：
 *   - 鼠标悬停：节点轻微上浮 + 阴影加深 + 浏览器 title tooltip
 *   - 节点可传 onStepClick 使其可点（演示环境下跳转）
 */
export function StepProgress({ steps, currentIndex, completedIndices, onStepClick }: StepProgressProps) {
  const isCompleted = (i: number) => completedIndices.includes(i)
  const isCurrent = (i: number) => i === currentIndex

  return (
    <div className="bg-card border-b border-divider">
      <div className="flex items-start px-2 pt-3 pb-2">
        {steps.map((step, i) => {
          const completed = isCompleted(i)
          const current = isCurrent(i)
          const active = completed || current

          // hover 时显示的气泡文案
          const tooltip =
            step.hint ??
            (completed
              ? `✓ 第 ${i + 1} 步已完成：${step.title}`
              : current
                ? `当前第 ${i + 1} 步：${step.title}`
                : `第 ${i + 1} 步：${step.title}（待完成）`)

          // 左半段（连向前一个节点）的颜色
          const leftHalfColor =
            i === 0
              ? 'bg-transparent'
              : isCompleted(i - 1) || completed
                ? 'bg-gold-500'
                : 'bg-border'

          // 右半段（连向后一个节点）的颜色
          const rightHalfColor =
            i === steps.length - 1
              ? 'bg-transparent'
              : completed || current
                ? isCompleted(i + 1) || current
                  ? 'bg-gold-500'
                  : 'bg-gold-400/50'
                : 'bg-border'

          const clickable = !!onStepClick

          return (
            <div
              key={step.key}
              className={[
                'group relative flex flex-1 flex-col items-center',
                clickable ? 'cursor-pointer' : '',
              ].join(' ')}
              onClick={clickable ? () => onStepClick!(i, step.key) : undefined}
              title={tooltip}
            >
              {/* 左半段连线（除了第一个节点） */}
              {i > 0 && (
                <div
                  className={[
                    'absolute top-[14px] right-1/2 h-[2px] w-1/2 transition-colors',
                    leftHalfColor,
                  ].join(' ')}
                />
              )}
              {/* 右半段连线（除了最后一个节点） */}
              {i < steps.length - 1 && (
                <div
                  className={[
                    'absolute top-[14px] left-1/2 h-[2px] w-1/2 transition-colors',
                    rightHalfColor,
                  ].join(' ')}
                />
              )}

              {/* 状态圆点：hover 上浮 + 发光 */}
              <div
                className={[
                  'relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200',
                  clickable ? 'group-hover:-translate-y-0.5' : '',
                  completed
                    ? 'bg-gold-500 text-white ring-2 ring-gold-500/20 group-hover:ring-4 group-hover:ring-gold-500/35 group-hover:scale-110'
                    : current
                      ? 'bg-gold-500/15 text-gold-700 ring-2 ring-gold-500 ring-offset-2 ring-offset-card scale-110 group-hover:ring-4'
                      : 'bg-surface-2 text-icon-muted group-hover:bg-surface-1 group-hover:text-foreground group-hover:ring-2 group-hover:ring-gold-300/60',
                ].join(' ')}
              >
                {completed ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span className="text-caption font-semibold">{i + 1}</span>
                )}
              </div>

              {/* 步骤标题：hover 加粗 */}
              <p
                className={[
                  'mt-1.5 max-w-[72px] text-center text-micro leading-tight truncate transition-all',
                  active
                    ? 'text-foreground font-medium'
                    : 'text-icon-muted group-hover:text-foreground group-hover:font-medium',
                ].join(' ')}
              >
                {step.title}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
