import { useId } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FieldFrame } from './FieldFrame'

export interface ChoiceOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

/**
 * 单选组：选项自带标题与说明，选中态用描边 + 浅主色，不用整块填色。
 * 适合品类、成色、结算方式等互斥选择；超过 6 项改用 PickerSheet。
 */
export function ChoiceGroup({
  label,
  value,
  onChange,
  options,
  columns = 1,
  hint,
  error,
  required = false,
  name,
  className,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  options: ChoiceOption[]
  columns?: 1 | 2
  hint?: string
  error?: string
  required?: boolean
  name?: string
  className?: string
}) {
  const id = useId()

  return (
    <FieldFrame
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      <div
        role="radiogroup"
        aria-label={label}
        aria-invalid={error ? true : undefined}
        className={cn('grid gap-2', columns === 2 && 'grid-cols-2')}
      >
        {options.map((option) => {
          const checked = option.value === value

          return (
            <label
              key={option.value}
              className={cn(
                'flex min-h-11 cursor-pointer items-center gap-3 rounded-sm bg-card px-3 py-2.5 ring-1 ring-border transition',
                checked && 'bg-primary-soft ring-primary',
                option.disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <input
                type="radio"
                name={name ?? id}
                value={option.value}
                checked={checked}
                disabled={option.disabled}
                onChange={() => onChange?.(option.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition',
                  checked
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card',
                )}
                aria-hidden="true"
              >
                {checked ? <Check size={13} strokeWidth={3} /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-body-strong text-foreground">{option.label}</span>
                {option.description ? (
                  <span className="mt-0.5 block text-caption text-muted-foreground">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          )
        })}
      </div>
    </FieldFrame>
  )
}
