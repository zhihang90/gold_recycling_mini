import { MediaVisual } from '@/components'
import { useRef } from 'react'
import { Plus, X, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
} as const

const TILE_ASPECT = {
  square: 'aspect-square',
  wide: 'aspect-4/3',
} as const

/**
 * 照片上传位：本地选择、预览、删除，不接真实上传接口。
 * 缩略图默认 1:1、四列；证件类可设 columns=1 + aspect="wide" 拉成 4:3 单张。
 * 删除按钮视觉 24、点击区 44。
 */
export function PhotoUploader({
  value,
  onChange,
  max = 6,
  hint,
  readOnly = false,
  addLabel = '添加',
  addIcon: AddIcon = Plus,
  columns = 4,
  aspect = 'square',
  showCount = true,
  className,
}: {
  value: string[]
  onChange: (next: string[]) => void
  max?: number
  hint?: string
  readOnly?: boolean
  /** 添加位文案，默认为“添加” */
  addLabel?: string
  /** 添加位图标，默认为加号 */
  addIcon?: LucideIcon
  /** 每行列数，证件单张上传用 1 */
  columns?: keyof typeof COLUMNS
  /** 缩略图比例，证件类用 wide（4:3） */
  aspect?: keyof typeof TILE_ASPECT
  /** 是否显示 x/y 计数 */
  showCount?: boolean
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const remaining = Math.max(0, max - value.length)

  const handleFiles = (files: FileList | null) => {
    if (!files || remaining === 0) return
    const picked = Array.from(files).slice(0, remaining)
    void Promise.all(picked.map(readAsDataUrl)).then((urls) => {
      onChange([...value, ...urls])
    })
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('space-y-2', className)}>
      <ul className={cn('grid gap-2', COLUMNS[columns])}>
        {value.map((url, index) => (
          <li
            key={`${url.slice(-16)}-${index}`}
            className="relative overflow-hidden rounded-sm ring-1 ring-border"
          >
            <MediaVisual src={url} alt={`已选照片 ${index + 1}`} ratio={aspect === 'wide' ? 'tall' : 'square'} />
            {readOnly ? null : (
              <button
                type="button"
                aria-label={`删除第 ${index + 1} 张照片`}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="absolute -top-2 -right-2 flex h-11 w-11 items-center justify-center"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900/70 text-paper">
                  <X size={12} />
                </span>
              </button>
            )}
          </li>
        ))}

        {readOnly || remaining === 0 ? null : (
          <li>
            <label
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-border bg-card text-subtle-foreground transition focus-within:border-primary',
                TILE_ASPECT[aspect],
              )}
            >
              <AddIcon size={20} />
              <span className="text-caption">{addLabel}</span>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => handleFiles(event.target.files)}
              />
            </label>
          </li>
        )}
      </ul>

      <p className={cn('text-caption text-subtle-foreground tabular', !showCount && 'hidden')}>
        {value.length}/{max}
        {hint ? ` · ${hint}` : ''}
      </p>
    </div>
  )
}
