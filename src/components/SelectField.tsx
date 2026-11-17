import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FieldFrame } from './FieldFrame'
import { fieldDescribedBy } from './fieldIds'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

/**
 * 选择框：移动端原生 select，保留系统选择器与无障碍能力。
 * 只接管外观，不接管弹层，避免与 PickerSheet 形成两套选择交互。
 */
export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = '请选择',
  hint,
  error,
  required = false,
  disabled = false,
  name,
  className,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  name?: string
  className?: string
}) {
  const id = useId()

  return (
    <FieldFrame
      id={id}
      htmlFor={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      <div
        className={cn(
          'relative flex h-11 items-center rounded-sm bg-card ring-1 ring-border transition',
          'focus-within:ring-primary',
          error && 'ring-destructive',
          disabled && 'bg-muted',
        )}
      >
        <select
          id={id}
          name={name}
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(id, error, hint)}
          onChange={(event) => onChange?.(event.target.value)}
          className={cn(
            'h-full w-full appearance-none bg-transparent pl-3 pr-10 text-body outline-none',
            value ? 'text-foreground' : 'text-subtle-foreground',
            disabled && 'cursor-not-allowed text-ink-400',
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 text-ink-400"
          aria-hidden="true"
        />
      </div>
    </FieldFrame>
  )
}
