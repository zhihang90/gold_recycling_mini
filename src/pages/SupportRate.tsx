import { Button, Card, Chip, DetailPage, FormField, InlineNotice, Toast } from '@/components'
import { useState } from 'react'
import { Headset, Star } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import {
  SUPPORT_RATE_TAGS,
  createDemoRateSession,
  findSupportSession,
  rateSupportSession,
  supportTimeLabel,
  type SupportSession,
} from '@/mocks/support'
import { routePath } from '@/routes/paths'

const RATE_LABELS = ['', '非常不满意', '不满意', '一般', '满意', '非常满意']

/** 会话评价：星级必选，标签与文字选填，提交后回到客服首页 */
export function SupportRatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [session] = useState<SupportSession>(() => {
    const id = searchParams.get('session')
    if (id) {
      const found = findSupportSession(id)
      if (found) return found
    }
    // 静态原型：无有效会话时直接展示演示评价内容，不做失效判断
    return createDemoRateSession()
  })

  const [score, setScore] = useState(session.rating?.score ?? 0)
  const [tags, setTags] = useState<string[]>(session.rating?.tags ?? [])
  const [comment, setComment] = useState(session.rating?.comment ?? '')
  const [toast, setToast] = useState<string | null>(null)

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]))
  }

  const submit = () => {
    if (score === 0) {
      setToast('请先选择满意度')
      return
    }
    rateSupportSession(session.id, {
      score,
      tags,
      comment: comment.trim(),
      at: Date.now(),
    })
    navigate(routePath('support.home'), {
      state: { toast: '感谢您的评价，我们会持续改进服务' },
    })
  }

  return (
    <DetailPage
      title="服务评价"
      footer={
        <Button block onClick={submit}>
          提交评价
        </Button>
      }
    >
      <Card padding="md" className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Headset size={22} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-body-strong text-foreground">
            {session.servedBy === 'agent' ? '人工客服 小安' : '智能客服 小安'}
          </p>
          <p className="mt-1 truncate text-caption text-subtle-foreground">
            {session.topic} · {supportTimeLabel(session.updatedAt)}
          </p>
        </div>
      </Card>

      {session.rating ? (
        <InlineNotice tone="info" title="该会话已评价">
          你可以在下方调整评价并重新提交，最新结果将覆盖上一次评价。
        </InlineNotice>
      ) : null}

      <Card padding="md" className="space-y-3">
        <div>
          <p className="text-body-strong text-foreground">本次服务满意度</p>
          <p className="mt-0.5 text-caption text-subtle-foreground">
            请为本次服务打分，帮助我们发现服务中的问题。
          </p>
        </div>
        <div className="flex items-center justify-center gap-1 py-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} 星`}
              aria-pressed={score >= value}
              onClick={() => setScore(value)}
              className="flex h-11 w-11 items-center justify-center rounded-full transition active:bg-surface-2"
            >
              <Star
                size={30}
                fill={value <= score ? 'currentColor' : 'none'}
                className={value <= score ? 'text-price' : 'text-icon-muted'}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
        <p className="text-center text-body text-muted-foreground">
          {score > 0 ? RATE_LABELS[score] : '点击星星选择满意度'}
        </p>
      </Card>

      <Card padding="md" className="space-y-3">
        <p className="text-body-strong text-foreground">哪些方面做得好？（多选）</p>
        <div className="flex flex-wrap gap-2">
          {SUPPORT_RATE_TAGS.map((tag) => (
            <Chip key={tag} active={tags.includes(tag)} onClick={() => toggleTag(tag)}>
              {tag}
            </Chip>
          ))}
        </div>
      </Card>

      <Card padding="md">
        <FormField
          label="评价内容（选填）"
          value={comment}
          onChange={setComment}
          multiline
          rows={4}
          maxLength={200}
          placeholder="说说本次服务的体验，或留下你的建议"
        />
      </Card>

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}
