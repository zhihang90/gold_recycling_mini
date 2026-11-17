import type { ReactNode } from 'react'
import { Circle, CircleCheck, CircleSlash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export type PrerequisiteState = 'done' | 'pending' | 'exempt'

export type PrerequisiteItem = {
  key: string
  title: string
  description?: string
  state: PrerequisiteState
  /** done / exempt 时展示的状态文案，例如「已绑定」「已签情况说明」 */
  statusText?: string
  /** pending 时可点，按钮文案由页面给 */
  actionLabel?: string
  onAction?: () => void
}

const ICON = {
  done: { Icon: CircleCheck, className: 'text-success' },
  pending: { Icon: Circle, className: 'text-ink-400' },
  exempt: { Icon: CircleSlash, className: 'text-ink-400' },
} as const

const STATUS_TEXT = {
  done: 'text-success',
  pending: 'text-warning',
  exempt: 'text-subtle-foreground',
} as const

/**
 * 前置条件清单：实名 / 银行卡 / 协议 / 电子签 / 来源说明。
 * - 状态全部由页面传入，组件不推断、不默认全绿
 * - 可豁免项用 state='exempt' 表达（例如购买凭证改签情况说明），不是硬阻断
 * - 不展示风控原因与规则，只显示「已完成 / 待完成 / 已豁免」
 * - 已完成与已豁免项不可点，避免重复签署
 */
export function PrerequisiteList({
  items,
  hint,
  className,
}: {
  items: PrerequisiteItem[]
  hint?: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <ul className="divide-y divide-line-soft">
        {items.map((item) => {
          const icon = ICON[item.state]
          const Icon = icon.Icon
          const clickable = item.state === 'pending' && !!item.onAction

          return (
            <li key={item.key} className="flex min-h-14 items-start gap-3 py-3">
              <Icon size={20} className={cn('mt-1 shrink-0', icon.className)} aria-hidden />

              <div className="min-w-0 flex-1">
                <div className="text-body-strong text-foreground">{item.title}</div>
                {item.description ? (
                  <div className="mt-1 text-caption text-muted-foreground">{item.description}</div>
                ) : null}
              </div>

              <div className="shrink-0 self-center">
                {clickable ? (
                  <Button variant="text" size="sm" onClick={item.onAction}>
                    {item.actionLabel}
                  </Button>
                ) : item.statusText ? (
                  <span className={cn('text-caption', STATUS_TEXT[item.state])}>
                    {item.statusText}
                  </span>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      {hint ? <div className="mt-2 text-caption text-subtle-foreground">{hint}</div> : null}
    </div>
  )
}
