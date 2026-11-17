import { ChevronRight, UserRound, type LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { BrandMark } from './BrandMark'

/**
 * 个人中心头部：头像 + 标题 + 说明 + 箭头。
 * 未登录与已登录共用，登录态只换文案。
 */
export function ProfileCard({
  title,
  description,
  icon = UserRound,
  onClick,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  onClick?: () => void
}) {
  return (
    <Card padding="md">
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-14 w-full items-center gap-3 rounded-md text-left transition active:bg-surface-2"
      >
        <BrandMark icon={icon} />
        <span className="min-w-0 flex-1">
          <span className="block text-section text-foreground">{title}</span>
          {description ? (
            <span className="mt-1 block text-body text-muted-foreground">{description}</span>
          ) : null}
        </span>
        <ChevronRight size={20} className="shrink-0 text-icon-muted" aria-hidden="true" />
      </button>
    </Card>
  )
}
