import { Button } from './Button'
import { Card } from './Card'

/**
 * 粘贴识别框：把一段包含姓名、电话与地址的文本拆成表单字段。
 * 识别逻辑由页面负责，这里只提供输入、反馈与动作入口。
 */
export function PasteRecognizeBox({
  value,
  onChange,
  onRecognize,
  hint,
  error = false,
  placeholder = '「粘贴识别」或输入文本，智能拆分姓名、手机号和地址',
  actionLabel = '粘贴并识别',
  maxLength = 200,
}: {
  value: string
  onChange: (value: string) => void
  onRecognize: () => void
  hint?: string
  error?: boolean
  placeholder?: string
  actionLabel?: string
  maxLength?: number
}) {
  return (
    <Card padding="md" className="space-y-2">
      <label className="block">
        <span className="sr-only">粘贴地址文本</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          maxLength={maxLength}
          placeholder={placeholder}
          className="min-h-20 w-full resize-none bg-transparent text-body text-foreground outline-none placeholder:text-subtle-foreground"
        />
      </label>

      <div className="flex items-end justify-between gap-3">
        <p
          className={
            error
              ? 'min-w-0 text-caption text-destructive'
              : 'min-w-0 text-caption text-subtle-foreground'
          }
        >
          {hint}
        </p>
        <Button variant="secondary" size="sm" onClick={onRecognize} className="shrink-0">
          {actionLabel}
        </Button>
      </div>
    </Card>
  )
}
