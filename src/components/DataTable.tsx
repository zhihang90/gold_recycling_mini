import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface DataTableColumn {
  key: string
  label: ReactNode
  align?: 'left' | 'center' | 'right'
}

function alignClass(align: DataTableColumn['align']) {
  if (align === 'left') return 'text-left'
  if (align === 'right') return 'text-right'
  return 'text-center'
}

/**
 * 轻量数据表：规则弹层、费用说明等三列以内的小表。
 * 只做展示；列对齐由列定义控制，单元格内容支持任意 ReactNode。
 */
export function DataTable({
  columns,
  rows,
  caption,
  className,
}: {
  columns: DataTableColumn[]
  rows: Record<string, ReactNode>[]
  caption?: string
  className?: string
}) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-caption">
        {caption ? (
          <caption className="pb-2 text-left text-caption text-subtle-foreground">
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'border border-border bg-surface-2 px-2 py-2 text-caption-strong text-foreground',
                  alignClass(column.align),
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'border border-border px-2 py-2 align-top text-muted-foreground',
                    alignClass(column.align),
                  )}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
