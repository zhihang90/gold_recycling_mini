import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Badge, type BadgeTone } from './Badge'
import { Button } from './Button'
import { Card } from './Card'
import { InlineNotice } from './InlineNotice'
import { KeyValueRow } from './KeyValueRow'
import { MediaVisual } from './MediaVisual'
import { PriceText } from './PriceText'

type AssayLabels = {
  org?: string
  method?: string
  inspectedAt?: string
  assayNo?: string
  weight?: string
  fineness?: string
  meltWeight?: string
  recheck?: string
  recheckConclusion?: string
}

const DEFAULT_LABELS: Required<AssayLabels> = {
  org: '检测机构',
  method: '检测方式',
  inspectedAt: '检测时间',
  assayNo: '检测编号',
  weight: '实测毛重',
  fineness: '含金量',
  meltWeight: '可熔重量',
  recheck: '复检记录',
  recheckConclusion: '复检结论',
}

type AssayBaseProps = {
  title: string
  /** 结论与语气由页面给定，组件不内置「一致 / 有差异」文案 */
  result: { tone: BadgeTone; label: string }
  org: string
  method: string
  inspectedAt: string
  assayNo?: string
  weight: number
  fineness: number
  meltWeight?: number
  images?: string[]
  onViewImages?: () => void
  imagesLabel?: string
  recheck?: { org: string; at: string; conclusion: string; delta?: string }
  labels?: AssayLabels
  footer?: ReactNode
  className?: string
}

/**
 * 检测与复检结果卡。
 * - 破坏性检测提示位不可隐藏：`breaking: true` 时 TypeScript 强制要求 `breakingNote`
 * - 复检只允许一次（单对象，不是数组），避免界面暗示可多次复检
 * - 不展示检测内部参数、设备型号、人员姓名；不提供原图/报告下载
 */
export type AssayResultCardProps = AssayBaseProps &
  (
    | { breaking: true; breakingNote: ReactNode }
    | { breaking?: false; breakingNote?: ReactNode }
  )

export function AssayResultCard(props: AssayResultCardProps) {
  const {
    title,
    result,
    org,
    method,
    inspectedAt,
    assayNo,
    weight,
    fineness,
    meltWeight,
    images,
    onViewImages,
    imagesLabel,
    recheck,
    labels,
    footer,
    className,
  } = props

  const text = { ...DEFAULT_LABELS, ...labels }
  const breaking = props.breaking === true

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-card-title text-foreground">{title}</span>
        <Badge tone={result.tone}>{result.label}</Badge>
      </div>

      <div className="mt-2 divide-y divide-line-soft">
        <KeyValueRow label={text.org} value={org} />
        <KeyValueRow label={text.method} value={method} />
        <KeyValueRow label={text.inspectedAt} value={<span className="tabular">{inspectedAt}</span>} />
        {assayNo ? (
          <KeyValueRow label={text.assayNo} value={<span className="tabular">{assayNo}</span>} />
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-surface-2 px-3 py-3">
        <div className="min-w-0">
          <div className="text-caption text-subtle-foreground">{text.weight}</div>
          <PriceText value={weight} prefix="" suffix="克" size="card-title" tone="gold" />
        </div>
        <div className="min-w-0">
          <div className="text-caption text-subtle-foreground">{text.fineness}</div>
          <span className="text-card-title tabular text-foreground">{fineness}%</span>
        </div>
        <div className="min-w-0">
          <div className="text-caption text-subtle-foreground">{text.meltWeight}</div>
          {typeof meltWeight === 'number' ? (
            <PriceText value={meltWeight} prefix="" suffix="克" size="card-title" tone="gold" />
          ) : (
            <span className="text-card-title text-ink-400">—</span>
          )}
        </div>
      </div>

      {breaking ? (
        <InlineNotice tone="warning" className="mt-3">
          {props.breakingNote}
        </InlineNotice>
      ) : null}

      {images && images.length > 0 ? (
        <div className="mt-3">
          <div className="grid grid-cols-4 gap-2">
            {images.slice(0, 4).map((src, index) => (
              <MediaVisual
                key={`${src}-${index}`}
                src={src}
                ratio="square"
                className="rounded-sm"
                alt=""
              />
            ))}
          </div>
          {onViewImages && images.length > 1 ? (
            <div className="mt-2 text-right">
              <Button variant="text" size="sm" onClick={onViewImages}>
                {imagesLabel}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {recheck ? (
        <div className="mt-3 border-t border-line-soft pt-3">
          <div className="text-caption-strong text-subtle-foreground">{text.recheck}</div>
          <div className="mt-1 divide-y divide-line-soft">
            <KeyValueRow label={text.org} value={recheck.org} />
            <KeyValueRow
              label={text.inspectedAt}
              value={<span className="tabular">{recheck.at}</span>}
            />
            <KeyValueRow label={text.recheckConclusion} value={recheck.conclusion} emphasis />
          </div>
          {recheck.delta ? (
            <div className="text-caption tabular text-subtle-foreground">{recheck.delta}</div>
          ) : null}
        </div>
      ) : null}

      {footer ? <div className="mt-3">{footer}</div> : null}
    </Card>
  )
}
