import { cn } from '@/lib/utils'
import { Badge } from './Badge'
import { Card } from './Card'
import { MediaVisual } from './MediaVisual'
import { PhotoUploader } from './PhotoUploader'

export interface UploadSlot {
  key: string
  label: string
  value: string[]
  onChange: (next: string[]) => void
  /** 单槽最少张数，只用于提示，不阻断提交 */
  min?: number
  max?: number
  hint?: string
}

interface UploadGroupBaseProps {
  title: string
  description?: string
  required?: boolean
  min?: number
  max?: number
  hint?: string
  examples?: { src: string; alt: string }[]
  readOnly?: boolean
  error?: string
  className?: string
}

type UploadGroupSingleProps = UploadGroupBaseProps & {
  value: string[]
  onChange: (next: string[]) => void
  slots?: undefined
}

type UploadGroupSlotsProps = UploadGroupBaseProps & {
  slots: UploadSlot[]
  value?: undefined
  onChange?: undefined
}

export type UploadGroupProps = UploadGroupSingleProps | UploadGroupSlotsProps

function countHint(count: number, min: number) {
  if (min <= 0) return undefined
  return count < min ? `最少 ${min} 张，还差 ${min - count} 张` : `已满足最少 ${min} 张`
}

/**
 * 分组上传：标题 / 必填 / 最少张数 / 示例图，上传能力复用 PhotoUploader。
 * - 默认单组上传：value + onChange + max
 * - 需要「正面图 / 反面图」这类多槽位时传 slots，每槽独立计数
 * 只负责展示与计数提示，不校验张数是否达标，提交拦截由页面决定。
 */
export function UploadGroup(props: UploadGroupProps) {
  const {
    title,
    description,
    required = false,
    min = 0,
    max = 6,
    hint,
    examples = [],
    readOnly = false,
    error,
    className,
  } = props

  const singleMinHint =
    !props.slots && min > 0 ? countHint(props.value.length, min) : undefined
  const mergedHint = [singleMinHint, hint].filter(Boolean).join(' · ') || undefined

  return (
    <Card padding="md" className={cn('space-y-3', className)}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-card-title text-foreground">{title}</span>
          {required ? (
            <Badge tone="primary">必填</Badge>
          ) : (
            <span className="text-caption text-subtle-foreground">（非必填）</span>
          )}
        </div>
        {description ? (
          <p className="mt-1 text-caption text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {examples.length > 0 ? (
        <div className="flex items-start gap-2">
          <span className="mt-1 shrink-0 text-caption text-subtle-foreground">示例</span>
          <ul className="flex gap-2">
            {examples.map((example) => (
              <li
                key={example.src}
                className="w-16 overflow-hidden rounded-sm ring-1 ring-border"
              >
                <MediaVisual src={example.src} alt={example.alt} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {props.slots ? (
        <div className="space-y-3">
          {props.slots.map((slot) => {
            const slotHint =
              [countHint(slot.value.length, slot.min ?? 0), slot.hint]
                .filter(Boolean)
                .join(' · ') || undefined

            return (
              <div key={slot.key} className="space-y-2">
                <div className="text-body-strong text-foreground">{slot.label}</div>
                <PhotoUploader
                  value={slot.value}
                  onChange={slot.onChange}
                  max={slot.max ?? 1}
                  hint={slotHint}
                  readOnly={readOnly}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <PhotoUploader
          value={props.value}
          onChange={props.onChange}
          max={max}
          hint={mergedHint}
          readOnly={readOnly}
        />
      )}

      {error ? <p className="text-caption text-destructive">{error}</p> : null}
    </Card>
  )
}
