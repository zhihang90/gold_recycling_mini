import { Button, Card, Chip, MarkdownDoc, PageHeader, PageShell } from '@/components'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AGREEMENT_DOCUMENTS } from '@/content/agreements'
import { GOLD_SOURCE_OPTIONS, saveAgreementConfirmation } from '@/mocks/agreement'
import { paths } from '@/routes/paths'

/**
 * 阅读并同意相关须知（独立全屏路由）：
 * - 两份协议拼成一条长文，滚动到底视为阅读完成，进度只增不减；
 * - 黄金来源为必选项；
 * - 阅读 100% 且已选来源才可确认，确认后回下单页回填勾选态。
 */
export function QuoteAgreementPage() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [readPercent, setReadPercent] = useState(0)
  const [source, setSource] = useState('')

  const syncProgress = useCallback(() => {
    const element = scrollRef.current
    if (!element) return
    const max = element.scrollHeight - element.clientHeight
    const percent =
      max <= 4 || element.scrollTop >= max - 2
        ? 100
        : Math.min(99, Math.round((element.scrollTop / max) * 100))
    setReadPercent((prev) => Math.max(prev, percent))
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(syncProgress)
    window.addEventListener('resize', syncProgress)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', syncProgress)
    }
  }, [syncProgress])

  const canConfirm = readPercent >= 100 && Boolean(source)

  const onConfirm = () => {
    if (!canConfirm) return
    saveAgreementConfirmation({ source, agreedAt: Date.now() })
    navigate(paths.quote, { replace: true })
  }

  return (
    <PageShell className="h-full" padded={false}>
      <PageHeader title="阅读并同意相关须知" />

      {/* 阅读进度：随滚动实时增长 */}
      <div className="h-0.5 shrink-0 bg-surface-2">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${readPercent}%` }}
        />
      </div>

      {/* 协议正文：单流滚动，两份协议依次排布 */}
      <div
        ref={scrollRef}
        onScroll={syncProgress}
        className="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-3"
      >
        <Card padding="lg">
          {AGREEMENT_DOCUMENTS.map((document, index) => (
            <MarkdownDoc
              key={document.key}
              source={document.content}
              className={index > 0 ? 'mt-5 border-t border-border-subtle pt-5' : undefined}
            />
          ))}
        </Card>
        <p className="py-3 text-center text-caption text-subtle-foreground tabular">
          已阅读 {readPercent}%
        </p>
      </div>

      {/* 来源必选 + 确认按钮 */}
      <div className="shrink-0 border-t border-border-subtle bg-card px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <div className="flex items-center gap-3 pb-3">
          <span className="shrink-0 text-caption-strong text-foreground">
            黄金来源<span className="text-destructive">*</span>
          </span>
          <div className="flex min-w-0 flex-1 gap-2">
            {GOLD_SOURCE_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                active={source === option.value}
                onClick={() => setSource(option.value)}
                className="min-w-0 flex-1 px-0"
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>
        <Button
          size="lg"
          block
          disabled={!canConfirm}
          onClick={onConfirm}
          className="h-auto min-h-12 py-2.5 text-caption-strong"
        >
          请阅读《须知》《协议》后确认并同意（已阅读 {readPercent}%）
        </Button>
      </div>
    </PageShell>
  )
}
