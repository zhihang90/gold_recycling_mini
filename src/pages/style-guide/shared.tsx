import { PageHeader, PageShell, Card } from '@/components'
import type { ReactNode } from 'react'

/** 组件库样张页的共用外壳：只被 style-guide 下的样张页引用 */

/** 样张页统一外壳：页面标题 + 左右 16px 内容区 */
export function GuidePage({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <PageShell>
      <PageHeader title={title} showBack={false} />
      <div className="space-y-4 px-4 pt-4">{children}</div>
    </PageShell>
  )
}

/** 单个组件区块：标题 + 卡片内容 */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="space-y-3 p-4">
      <div className="text-caption-strong text-subtle-foreground">{title}</div>
      {children}
    </Card>
  )
}

/** 色板行 */
export function SwatchRow({
  title,
  items,
}: {
  title: string
  items: { name: string; className: string }[]
}) {
  return (
    <div>
      <div className="mb-2 text-caption-strong text-subtle-foreground">{title}</div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <div key={item.name} className="min-w-0">
            <div className={`h-9 rounded-sm ring-1 ring-border ${item.className}`} />
            <div className="mt-1 truncate text-caption text-subtle-foreground">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GuideFooter({ children }: { children: ReactNode }) {
  return <div className="pb-2 text-center text-caption text-subtle-foreground">{children}</div>
}
