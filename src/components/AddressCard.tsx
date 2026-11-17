import type { KeyboardEvent } from 'react'
import { Check, ChevronRight, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from './Badge'
import { Card } from './Card'
import { TextLink } from './TextLink'

/**
 * 收货地址卡：
 * - display 形态用于订单详情，右上角提供「编辑」文字入口
 * - select 形态用于选择地址，整卡可点，选中态换主色描边
 * 手机号由调用方脱敏后传入，组件不做任何打码。
 */
export function AddressCard({
  name,
  phone,
  region,
  detail,
  tag,
  mode = 'display',
  selected = false,
  actionLabel,
  onAction,
  onClick,
  className,
}: {
  name: string
  phone: string
  region: string
  detail: string
  tag?: string
  mode?: 'display' | 'select'
  selected?: boolean
  actionLabel?: string
  onAction?: () => void
  onClick?: () => void
  className?: string
}) {
  const selectMode = mode === 'select'
  const interactive = onClick !== undefined

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return
    // 让卡片内的编辑按钮自己处理键盘事件
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  return (
    <Card
      padding="md"
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex items-start gap-3 text-left',
        interactive && 'cursor-pointer transition active:bg-surface-2',
        selectMode && selected && 'ring-primary',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-body-strong text-foreground">{name}</span>
          <span className="text-body text-muted-foreground tabular">{phone}</span>
          {tag ? <Badge tone="primary">{tag}</Badge> : null}
        </div>
        <p className="mt-1 text-body text-muted-foreground">
          {region} {detail}
        </p>
      </div>

      {selectMode ? (
        selected ? (
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check size={14} strokeWidth={3} aria-hidden="true" />
          </span>
        ) : (
          <ChevronRight size={16} className="mt-1 shrink-0 text-icon-muted" aria-hidden="true" />
        )
      ) : onAction ? (
        <span className="shrink-0" onClick={(event) => event.stopPropagation()}>
          <TextLink onClick={onAction}>
            <Pencil size={14} aria-hidden="true" />
            {actionLabel ?? '编辑'}
          </TextLink>
        </span>
      ) : null}
    </Card>
  )
}
