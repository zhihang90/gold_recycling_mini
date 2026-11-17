import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** 表单字段的 label / 提示 / 错误外壳：所有输入类组件共用，避免各写一套反馈样式 */
export function FieldFrame({
  id,
  htmlFor,
  label,
  required = false,
  hint,
  error,
  className,
  children,
}: {
  id: string
  /** 有对应表单控件时传控件 id；单选组等没有单一控件时留空 */
  htmlFor?: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  className?: string
  children: ReactNode
}) {
  const labelClass = 'block text-label text-ink-700'

  return (
    <div className={cn('space-y-2', className)}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={labelClass}>
          {label}
          {required ? <span className="ml-1 text-primary">*</span> : null}
        </label>
      ) : (
        <span className={labelClass}>
          {label}
          {required ? <span className="ml-1 text-primary">*</span> : null}
        </span>
      )}

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-caption text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-caption text-subtle-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
