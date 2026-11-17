import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { PriceText } from './PriceText'

export type FormulaFactor = { label: string; value: string; unit?: string }
export type FormulaDeduction = { label: string; value: string }

/**
 * 计价公式条：把「怎么算出来的」摊开，纯展示，不做任何计算。
 * - 因子之间固定用「×」，扣减用「−」，结果用「＝」
 * - 扣减项不得隐藏：传了就必须全部渲染；无费用时由页面在 note 里说明「无其他扣费」
 * - 375 宽自动折行，不压缩数值可读性
 */
export function FormulaExplainer({
  factors,
  deductions = [],
  result,
  resultLabel,
  note,
  compact = false,
  className,
}: {
  factors: FormulaFactor[]
  deductions?: FormulaDeduction[]
  result: number
  resultLabel?: string
  note?: ReactNode
  compact?: boolean
  className?: string
}) {
  const op = (symbol: string, key: string) => (
    <span key={key} aria-hidden className="shrink-0 text-caption text-ink-400">
      {symbol}
    </span>
  )

  const factorNode = (factor: FormulaFactor, index: number) => (
    <span key={`factor-${index}`} className="inline-flex items-baseline gap-1">
      <span className="text-caption text-subtle-foreground">{factor.label}</span>
      <span className={cn('tabular text-foreground', compact ? 'text-body' : 'text-body-strong')}>
        {factor.value}
      </span>
      {factor.unit ? (
        <span className="text-caption text-subtle-foreground">{factor.unit}</span>
      ) : null}
    </span>
  )

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-1 gap-y-2 rounded-md bg-surface-2 px-3',
          compact ? 'py-2' : 'py-3',
        )}
      >
        {factors.map((factor, index) => (
          <span key={`f-${index}`} className="inline-flex items-center gap-x-1">
            {index > 0 ? op('×', `mul-${index}`) : null}
            {factorNode(factor, index)}
          </span>
        ))}

        {deductions.map((item, index) => (
          <span key={`d-${index}`} className="inline-flex items-center gap-x-1">
            {op('−', `sub-${index}`)}
            <span className="inline-flex items-baseline gap-1">
              <span className="text-caption text-subtle-foreground">{item.label}</span>
              <span className={cn('tabular text-foreground', compact ? 'text-body' : 'text-body-strong')}>
                {item.value}
              </span>
            </span>
          </span>
        ))}

        {op('＝', 'eq')}
        <span className="inline-flex items-baseline gap-1">
          {resultLabel ? (
            <span className="text-caption text-subtle-foreground">{resultLabel}</span>
          ) : null}
          <PriceText value={result} size={compact ? 'body' : 'section'} tone="ink" />
        </span>
      </div>

      {note ? <div className="mt-2 text-caption text-subtle-foreground">{note}</div> : null}
    </div>
  )
}
