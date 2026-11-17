import { BottomSheet, Button } from '@/components'
import { useEffect, useState } from 'react'
import { CircleCheck } from 'lucide-react'

import { cn } from '@/lib/utils'

export type PickerOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

/**
 * 底部单选选择器（确认制）：选中只改草稿，点确定才提交。
 * 用于品类、纯度、合法来源、拒收原因、支付换卡等单选场景。
 */
export function PickerSheet({
  open,
  onClose,
  title,
  options,
  value,
  onConfirm,
  confirmText = '确定',
  footnote,
}: {
  open: boolean
  onClose: () => void
  title: string
  options: PickerOption[]
  value?: string
  onConfirm: (value: string) => void
  confirmText?: string
  footnote?: string
}) {
  const [draft, setDraft] = useState(value ?? '')

  useEffect(() => {
    if (open) setDraft(value ?? '')
  }, [open, value])

  const current = options.find((option) => option.value === draft)

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <Button
          block
          disabled={!current || current.disabled}
          onClick={() => {
            if (!current) return
            onConfirm(current.value)
            onClose()
          }}
        >
          {confirmText}
        </Button>
      }
    >
      <div role="radiogroup" aria-label={title} className="space-y-2">
        {options.map((option) => {
          const selected = option.value === draft
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={option.disabled}
              onClick={() => setDraft(option.value)}
              className={cn(
                'flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition',
                selected
                  ? 'bg-primary-soft text-primary-active ring-1 ring-primary-border'
                  : 'bg-card text-foreground active:bg-surface-2',
                option.disabled && 'cursor-not-allowed text-ink-400',
              )}
            >
              <span className="min-w-0">
                <span className="block text-body-strong">{option.label}</span>
                {option.description ? (
                  <span className="mt-1 block text-caption text-muted-foreground">
                    {option.description}
                  </span>
                ) : null}
              </span>
              {selected ? <CircleCheck size={16} className="shrink-0" /> : null}
            </button>
          )
        })}
      </div>

      {footnote ? (
        <p className="mt-3 text-caption text-subtle-foreground">{footnote}</p>
      ) : null}
    </BottomSheet>
  )
}
