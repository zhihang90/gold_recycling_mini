import { useId, useState } from 'react'
import { ChevronRight, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomSheet } from './BottomSheet'
import { FieldFrame } from './FieldFrame'
import { FormField } from './FormField'

export interface LocationOption {
  key: string
  /** 地点名，如「太平洋工业区」 */
  label: string
  /** 省市区与详细地址 */
  detail: string
}

/**
 * 地址选择字段：地图缩略占位 + 地址 + 门牌号。
 * 传 options 时点击地址打开模拟选址弹层；不接地图 SDK，也不做定位授权。
 */
export function LocationField({
  address,
  region,
  doorNo,
  onDoorNoChange,
  options = [],
  onSelect,
  required = false,
  label = '收货地址',
  className,
}: {
  address: string
  region?: string
  doorNo: string
  onDoorNoChange: (value: string) => void
  options?: LocationOption[]
  onSelect?: (option: LocationOption) => void
  required?: boolean
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const pickable = options.length > 0

  const handlePick = (option: LocationOption) => {
    onSelect?.(option)
    setOpen(false)
  }

  return (
    <div className={cn('space-y-3', className)}>
      <FieldFrame id={id} label={label} required={required}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!pickable}
          className="flex w-full items-center gap-3 rounded-sm bg-card p-3 text-left ring-1 ring-border transition active:bg-surface-2 disabled:active:bg-card"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-body-strong text-foreground">
              {address || '请选择收货地址'}
            </span>
            {region ? (
              <span className="mt-0.5 block text-caption text-subtle-foreground">{region}</span>
            ) : null}
          </span>
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-surface-2 text-icon-muted"
          >
            <MapPin size={20} />
          </span>
          <ChevronRight size={16} className="shrink-0 text-icon-muted" aria-hidden="true" />
        </button>
      </FieldFrame>

      <FormField
        label="门牌号"
        value={doorNo}
        onChange={onDoorNoChange}
        placeholder="楼栋 / 单元 / 门牌"
        hint="精确到门牌号，便于快递上门"
      />

      <BottomSheet open={open} onClose={() => setOpen(false)} title="选择地理位置">
        <ul className="space-y-2">
          {options.map((option) => (
            <li key={option.key}>
              <button
                type="button"
                onClick={() => handlePick(option)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-sm px-3 py-3 text-left ring-1 ring-border transition active:bg-surface-2',
                  option.label === address && 'ring-primary',
                )}
              >
                <MapPin size={18} className="shrink-0 text-icon-strong" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-strong text-foreground">{option.label}</span>
                  <span className="mt-0.5 block text-caption text-subtle-foreground">
                    {option.detail}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-caption text-subtle-foreground">
          示例数据：仅演示选址交互，不调用地图服务。
        </p>
      </BottomSheet>
    </div>
  )
}
