import type { ReactNode } from 'react'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { DataTable, type DataTableColumn } from './DataTable'

export interface RuleSection {
  key?: string
  title: string
  /** 有序列表，按传入顺序显示 1. 2. 3. */
  items?: ReactNode[]
  /** 列表后的补充说明 */
  note?: ReactNode
  table?: {
    columns: DataTableColumn[]
    rows: Record<string, ReactNode>[]
    caption?: string
  }
}

/**
 * 规则弹层：运费 / 保险 / 不支持回收范围等长规则，分节 + 有序列表 + 可选表格。
 * 底部默认「我知道了」；需要自定义操作时传 footer 覆盖。
 */
export function RuleSheet({
  open,
  onClose,
  title,
  sections,
  footer,
  confirmLabel = '我知道了',
  className,
}: {
  open: boolean
  onClose: () => void
  title: string
  sections: RuleSection[]
  footer?: ReactNode
  confirmLabel?: string
  className?: string
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      className={className}
      footer={footer ?? <Button block onClick={onClose}>{confirmLabel}</Button>}
    >
      <div className="space-y-5 pb-2">
        {sections.map((section, index) => (
          <section key={section.key ?? `${section.title}-${index}`} className="space-y-2">
            <h3 className="text-card-title text-foreground">{section.title}</h3>

            {section.items?.length ? (
              <ol className="list-decimal space-y-1 pl-5 text-body text-muted-foreground">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ol>
            ) : null}

            {section.table ? <DataTable {...section.table} /> : null}

            {section.note ? (
              <p className="text-caption text-subtle-foreground">{section.note}</p>
            ) : null}
          </section>
        ))}
      </div>
    </BottomSheet>
  )
}
