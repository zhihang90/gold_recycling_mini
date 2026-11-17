import type { ReactNode } from 'react'
import { Gem } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { Card } from './Card'
import { MediaVisual } from './MediaVisual'
import { PriceText } from './PriceText'

/**
 * 物品规格摘要：统一「品类 / 纯度 / 克重 / 件数 / 钢印 / 证书 / 照片」的口径。
 * - 只放事实字段，不放任何价格结论，避免预估价与终价混用
 * - variant='actual' 时字段名与预估完全一致，差异交给 CompareRows
 * - 无照片用占位块，不留塌陷
 */
export function ItemSpecCard({
  category,
  purity,
  weight,
  count,
  countUnit = '件',
  weightLabel = '克重',
  hallmark,
  certificate,
  photos,
  variant = 'estimate',
  badge,
  note,
  onViewPhotos,
  viewPhotosLabel,
  className,
}: {
  category: string
  purity: string
  weight: number
  count: number
  countUnit?: string
  weightLabel?: string
  hallmark?: string
  certificate?: string
  photos?: string[]
  variant?: 'estimate' | 'actual'
  badge?: ReactNode
  note?: ReactNode
  onViewPhotos?: () => void
  viewPhotosLabel?: string
  className?: string
}) {
  const cover = photos?.[0]

  return (
    <Card className={cn('flex items-start gap-3 p-4', className)} data-variant={variant}>
      {cover ? (
        <MediaVisual
          src={cover}
          ratio="square"
          className="h-16 w-16 shrink-0 rounded-sm"
          alt={category}
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm bg-surface-2">
          <Gem size={24} className="text-ink-400" />
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="min-w-0 truncate text-card-title text-foreground">{category}</span>
          {badge}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-body text-muted-foreground">
          <span>{purity}</span>
          <span aria-hidden>·</span>
          <span className="tabular">
            {count} {countUnit}
          </span>
          {hallmark ? (
            <>
              <span aria-hidden>·</span>
              <span>{hallmark}</span>
            </>
          ) : null}
          {certificate ? (
            <>
              <span aria-hidden>·</span>
              <span>{certificate}</span>
            </>
          ) : null}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-caption text-subtle-foreground">{weightLabel}</span>
          <PriceText
            value={weight}
            prefix=""
            suffix="克"
            size="body"
            tone={variant === 'actual' ? 'ink' : 'gold'}
            decimals={2}
          />
          {photos && photos.length > 1 && onViewPhotos ? (
            <Button variant="text" size="sm" onClick={onViewPhotos}>
              {viewPhotosLabel}
            </Button>
          ) : null}
        </div>

        {note ? <div className="text-caption text-subtle-foreground">{note}</div> : null}
      </div>
    </Card>
  )
}
