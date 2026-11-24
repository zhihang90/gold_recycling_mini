import {
  DetailPage,
  Card,
  Chip,
  ChipRow,
  SearchBar,
  TextLink,
  Button,
  EmptyState,
  Toast,
} from '@/components'
import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Clock, Headset, MessageSquareMore, ShieldAlert } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { SUPPORT_CATEGORIES, SUPPORT_FAQS, type SupportCategory } from '@/mocks/support'
import { routePath } from '@/routes/paths'

/** 客服首页：智能问答入口 + 投诉建议，问答展开就地看答案 */
export function SupportHomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const incomingToast = (location.state as { toast?: string } | null)?.toast ?? null
  const [toast, setToast] = useState<string | null>(incomingToast)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<SupportCategory | 'all'>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  // 评价 / 投诉提交后带回的提示只消费一次，避免返回时重复出现
  useEffect(() => {
    if (!incomingToast) return
    navigate(location.pathname, { replace: true, state: null })
  }, [incomingToast, location.pathname, navigate])

  const faqList = useMemo(() => {
    const keyword = query.trim()
    return SUPPORT_FAQS.filter((faq) => category === 'all' || faq.category === category)
      .filter((faq) => {
        if (!keyword) return true
        const haystack = `${faq.question}${faq.answer}${faq.keywords.join('')}`
        return haystack.includes(keyword)
      })
      .sort((a, b) => Number(Boolean(b.hot)) - Number(Boolean(a.hot)))
  }, [query, category])

  const startChat = (question?: string) => {
    const suffix = question ? `?q=${encodeURIComponent(question)}` : ''
    navigate(`${routePath('support.chat')}${suffix}`)
  }

  return (
    <DetailPage title="在线客服" onBack={() => navigate(-1)}>
      <Card padding="lg" className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Headset size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-card-title text-foreground">智能客服 小安</p>
            <p className="mt-1 text-body text-muted-foreground">
              7×24 小时在线，常见问题即时解答；复杂问题可转人工。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-caption text-subtle-foreground">
          <Clock size={14} aria-hidden="true" />
          人工客服服务时间 9:00–21:00
        </div>
        <Button block onClick={() => startChat()}>
          发起咨询
        </Button>
      </Card>

      <Card padding="md">
        <button
          type="button"
          onClick={() => navigate(routePath('support.feedback'))}
          className="flex w-full items-center gap-3 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
            <ShieldAlert size={20} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-body text-foreground">投诉与建议</span>
            <span className="mt-0.5 block text-caption text-subtle-foreground">
              1 个工作日内回复
            </span>
          </span>
        </button>
      </Card>

      <Card padding="md" className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquareMore size={18} className="text-primary" aria-hidden="true" />
          <h2 className="text-card-title text-foreground">常见问题</h2>
        </div>
        <SearchBar placeholder="搜索问题，如发货、退款、发票" value={query} onChange={setQuery} />
        <ChipRow>
          {SUPPORT_CATEGORIES.map((item) => (
            <Chip
              key={item.value}
              active={category === item.value}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </Chip>
          ))}
        </ChipRow>
      </Card>

      {faqList.length > 0 ? (
        <Card padding="none" className="overflow-hidden">
          {faqList.map((faq, index) => {
            const expanded = openId === faq.id
            return (
              <div key={faq.id} className={index > 0 ? 'border-t border-border-subtle' : undefined}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpenId(expanded ? null : faq.id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition active:bg-surface-2"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-caption text-primary">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-body text-foreground">{faq.question}</span>
                  <ChevronDown
                    size={16}
                    className={`mt-1 shrink-0 text-icon-muted transition-transform ${
                      expanded ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {expanded ? (
                  <div className="ml-9 space-y-2 pr-4 pb-3">
                    <p className="text-body text-muted-foreground">{faq.answer}</p>
                    <TextLink onClick={() => startChat(faq.question)}>没解决，问客服</TextLink>
                  </div>
                ) : null}
              </div>
            )
          })}
        </Card>
      ) : (
        <EmptyState
          icon={MessageSquareMore}
          title="没有找到相关问题"
          description="换个关键词试试，或直接咨询在线客服。"
          action={<Button onClick={() => startChat(query.trim() || undefined)}>直接问客服</Button>}
        />
      )}

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}
