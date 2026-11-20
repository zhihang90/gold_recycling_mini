import { useId, useRef } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FieldFrame } from './FieldFrame'
import { fieldDescribedBy } from './fieldIds'

/**
 * 输入框清除：浅灰实心圆 + 白色叉，视觉沿用系统输入框的惯用样式。
 * 命中区 44×44，圆本身 20；聚焦时圆环描边，避免整行出现矩形焦点框。
 */
function ClearButton({
  label,
  onClick,
  className,
}: {
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`清空${label}`}
      className={cn('group flex h-11 w-10 shrink-0 items-center justify-center rounded-full', className)}
    >
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full bg-icon-muted/50 transition-colors',
          'group-active:bg-icon-muted group-focus-visible:ring-2 group-focus-visible:ring-primary',
        )}
      >
        <X size={12} strokeWidth={3} className="text-paper" aria-hidden="true" />
      </span>
    </button>
  )
}

type FieldProps = {
  label: string
  value: string
  onChange?: (value: string) => void
  hint?: string
  error?: string
  required?: boolean
  unit?: string
  multiline?: boolean
  rows?: number
  /** 行内标签：标签在左、输入在右，用于登录这类单列表单 */
  inline?: boolean
  /** 无边框行式输入：标签作为占位与无障碍名，用底部分隔线分组，用于地址卡这类紧凑表单 */
  bare?: boolean
  /** 输入框右侧的附加操作，如「获取验证码」 */
  trailing?: ReactNode
  /** 隐藏字段上方的可见标签，占位符已说明字段内容（aria-label 仍保留） */
  hideLabel?: boolean
  className?: string
}

/**
 * 表单字段：标签常显 + 输入 + 单位 + 提示 / 错误。
 * 输入高 44，聚焦换主色描边；label 与输入用 useId 关联，错误与提示走 aria-describedby。
 * inline 只改布局，不改变校验与提示行为。
 */
export function FormField({
  label,
  value,
  onChange,
  hint,
  error,
  required = false,
  unit,
  multiline = false,
  rows = 3,
  inline = false,
  bare = false,
  trailing,
  hideLabel = false,
  className,
  type = 'text',
  inputMode,
  placeholder,
  maxLength,
  disabled = false,
  readOnly = false,
  name,
  autoComplete,
}: FieldProps &
  Pick<
    InputHTMLAttributes<HTMLInputElement>,
    | 'type'
    | 'inputMode'
    | 'placeholder'
    | 'maxLength'
    | 'disabled'
    | 'readOnly'
    | 'name'
    | 'autoComplete'
  >) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const describedBy = fieldDescribedBy(id, error, hint)
  const clearable = !disabled && !readOnly && Boolean(value) && Boolean(onChange)
  const handleClear = () => {
    onChange?.('')
    inputRef.current?.focus()
    textareaRef.current?.focus()
  }
  const shared = {
    id,
    value,
    name,
    disabled,
    readOnly,
    'aria-label': hideLabel ? label : undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    onChange: (event: { target: { value: string } }) => onChange?.(event.target.value),
    className: cn(
      'w-full text-body text-foreground outline-none placeholder:text-subtle-foreground',
      disabled && 'cursor-not-allowed text-ink-400',
    ),
  } satisfies TextareaHTMLAttributes<HTMLTextAreaElement>

  if (bare) {
    return (
      <div
        className={cn(
          'border-b border-border-subtle transition focus-within:border-primary',
          error && 'border-destructive',
          className,
        )}
      >
        <div className={cn('flex items-center gap-3', inline && 'min-h-12')}>
          {inline ? (
            <label htmlFor={id} className="w-16 shrink-0 text-body text-foreground">
              {label}
              {required ? <span className="ml-1 text-primary">*</span> : null}
            </label>
          ) : null}
          <input
            {...shared}
            ref={inputRef}
            type={type}
            inputMode={inputMode}
            maxLength={maxLength}
            placeholder={placeholder ?? label}
            autoComplete={autoComplete}
            aria-label={label}
            aria-required={required || undefined}
            className={cn(shared.className, 'h-11 min-w-0 flex-1 bg-transparent')}
          />
          {clearable ? <ClearButton label={label} onClick={handleClear} /> : null}
        </div>
        {error ? (
          <p id={`${id}-error`} className="pb-1 text-caption text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  if (inline) {
    return (
      <div className={className}>
        <div
          className={cn(
            'flex h-12 items-center gap-3 rounded-sm bg-surface-2 px-3 ring-1 ring-transparent transition',
            'focus-within:bg-card focus-within:ring-primary',
            error && 'ring-destructive',
            disabled && 'bg-muted',
          )}
        >
          <label htmlFor={id} className="w-16 shrink-0 text-label text-ink-700">
            {label}
            {required ? <span className="ml-1 text-primary">*</span> : null}
          </label>
          <input
            {...shared}
            ref={inputRef}
            type={type}
            inputMode={inputMode}
            maxLength={maxLength}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={cn(shared.className, 'min-w-0 flex-1 bg-transparent')}
          />
          {unit ? (
            <span className="shrink-0 text-body text-subtle-foreground">{unit}</span>
          ) : null}
          {clearable ? <ClearButton label={label} onClick={handleClear} /> : null}
          {trailing ? <span className="shrink-0">{trailing}</span> : null}
        </div>
        {error ? (
          <p id={`${id}-error`} className="mt-1 text-caption text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="mt-1 text-caption text-subtle-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <FieldFrame
      id={id}
      htmlFor={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      hideLabel={hideLabel}
      className={className}
    >
      {multiline ? (
        <div className="relative">
          <textarea
            {...shared}
            ref={textareaRef}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            className={cn(
              'min-h-24 w-full resize-none rounded-sm bg-card p-3 pr-12 text-body text-foreground ring-1 ring-border',
              'outline-none transition placeholder:text-subtle-foreground focus:ring-primary',
              error && 'ring-destructive',
              readOnly && 'text-muted-foreground',
              disabled && 'bg-muted',
            )}
          />
          {clearable ? (
            <ClearButton
              label={label}
              onClick={handleClear}
              className="absolute right-1 top-1"
            />
          ) : null}
        </div>
      ) : (
        <div
          className={cn(
            'flex h-11 items-center gap-2 rounded-sm bg-card px-3 ring-1 ring-border transition',
            'focus-within:ring-primary',
            error && 'ring-destructive',
            disabled && 'bg-muted',
          )}
        >
          <input
            {...shared}
            ref={inputRef}
            type={type}
            inputMode={inputMode}
            maxLength={maxLength}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={cn(shared.className, 'min-w-0 flex-1 bg-transparent')}
          />
          {unit ? (
            <span className="shrink-0 text-body text-subtle-foreground">{unit}</span>
          ) : null}
          {clearable ? <ClearButton label={label} onClick={handleClear} /> : null}
          {trailing ? <span className="shrink-0">{trailing}</span> : null}
        </div>
      )}
    </FieldFrame>
  )
}
