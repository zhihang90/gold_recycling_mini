import { useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { MediaVisual } from '@/components/MediaVisual'
import { cn } from '@/lib/utils'

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * 照片上传位：本地选择、预览、删除，不接真实上传接口。
 * 缩略图固定 1:1，添加位与缩略图同尺寸；删除按钮视觉 24、点击区 44。
 */
export function PhotoUploader({
  value,
  onChange,
  max = 6,
  hint,
  readOnly = false,
  className,
}: {
  value: string[]
  onChange: (next: string[]) => void
  max?: number
  hint?: string
  readOnly?: boolean
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
      <ul className="grid grid-cols-4 gap-2">
        {value.map((url, index) => (
          <li
            key={`${url.slice(-16)}-${index}`}
            className="relative overflow-hidden rounded-sm ring-1 ring-border"
          >
            <MediaVisual src={url} alt={`已选照片 ${index + 1}`} />
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
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-border bg-card text-subtle-foreground transition focus-within:border-primary">
              <Plus size={20} />
              <span className="text-caption">添加</span>
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

      <p className="text-caption text-subtle-foreground tabular">
        {value.length}/{max}
        {hint ? ` · ${hint}` : ''}
      </p>
    </div>
  )
}
