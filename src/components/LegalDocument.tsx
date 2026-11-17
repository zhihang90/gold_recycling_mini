import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card } from './Card'

export interface LegalSection {
  key?: string
  title: string
  paragraphs: ReactNode[]
}

/**
 * 合同 / 协议条款排版：标题 + 前言 + 分条段落。
 * 只负责排版与层级，不承载签署状态；签署入口由页面用 Button 提供。
 */
export function LegalDocument({
  title,
  preamble,
  sections,
  footer,
  className,
}: {
  title?: string
  preamble?: ReactNode
  sections: LegalSection[]
  footer?: ReactNode
  className?: string
}) {
  return (
    <Card padding="lg" className={cn('space-y-4', className)}>
      <article className="space-y-4">
        {title ? (
          <h2 className="text-center text-card-title text-foreground">{title}</h2>
        ) : null}

        {preamble ? (
          <div className="space-y-2 text-body text-muted-foreground">{preamble}</div>
        ) : null}

        {sections.map((section, index) => (
          <section key={section.key ?? `${section.title}-${index}`} className="space-y-2">
            <h3 className="text-body-strong text-foreground">{section.title}</h3>
            <div className="space-y-2 text-body text-muted-foreground">
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        {footer ? (
          <div className="border-t border-border-subtle pt-3 text-caption text-subtle-foreground">
            {footer}
          </div>
        ) : null}
      </article>
    </Card>
  )
}
