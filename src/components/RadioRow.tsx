import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 紧凑单选行：圆形选框 + 单行文案，用于「默认寄件地址」这类行内开关。
 * 与 ChoiceGroup 的区别是不带标题与说明，适合放在卡片底部操作区。
 */
export function RadioRow({
  label,
  checked,
  onChange,
  name,
  disabled = false,
  className,
}: {
  label: string
  checked: boolean
  onChange?: (checked: boolean) => void
  name?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <label
      className={cn(
        'inline-flex min-h-11 cursor-pointer items-center gap-2 text-body text-muted-foreground transition',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange?.(true)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition',
          checked ? 'border-primary bg-primary text-primary-foreground' : 'border-icon-muted bg-card',
        )}
      >
        {checked ? <Check size={13} strokeWidth={3} /> : null}
      </span>
      {label}
    </label>
  )
}
