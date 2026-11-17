import { cn } from '@/lib/utils'

/**
 * 开关：用于立即生效的偏好项（通知、免打扰）。
 * 需要「提交后才生效」的协议类选择，用 AgreementCheck，不用开关。
 */
export function SwitchField({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className,
}: {
  label: string
  description?: string
  checked: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-14 items-center gap-3 rounded-sm bg-card px-3 py-2.5 ring-1 ring-border',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="text-body-strong text-foreground">{label}</div>
        {description ? (
          <p className="mt-0.5 text-caption text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition',
          checked ? 'bg-primary' : 'bg-ink-400/40',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-card shadow-xs transition-transform',
            checked && 'translate-x-5',
          )}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}
