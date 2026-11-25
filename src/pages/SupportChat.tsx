import {
  BottomSheet,
  Button,
  Chip,
  DetailPage,
  IconButton,
  MediaVisual,
  TextLink,
} from '@/components'
import { images } from '@/assets/images'
import { useEffect, useRef, useState } from 'react'
import { Bot, ChevronRight, Headset, Image as ImageIcon, Send } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { findProduct } from '@/mocks/goldShop'
import { DEMO_RECYCLE_ORDERS, RECYCLE_STATUS_LABEL } from '@/mocks/recycleOrders'
import { SALES_STATUS_LABEL, findSalesOrder, salesTotal } from '@/mocks/salesOrders'
import {
  SUPPORT_QUICK_QUESTIONS,
  agentReply,
  botReply,
  createDemoChatSession,
  createSupportSession,
  readSupportSession,
  supportImageMessage,
  supportSystemMessage,
  supportTextMessage,
  writeSupportSession,
  type SupportMessage,
  type SupportOrderRef,
  type SupportSession,
} from '@/mocks/support'
import { orderDetailPath, recycleOrderDetailPath, routePath } from '@/routes/paths'
import { useReviewState } from '@/lib/useReviewState'

type ChatMode = 'live' | 'demo'

/** 从订单详情进入时，把订单摘要作为会话上下文 */
function resolveOrderRef(params: URLSearchParams): SupportOrderRef | undefined {
  const orderId = params.get('orderId')
  if (!orderId) return undefined

  if (params.get('kind') === 'recycle') {
    const order = DEMO_RECYCLE_ORDERS.find((item) => item.id === orderId)
    if (!order) return undefined
    return {
      kind: 'recycle',
      id: order.id,
      title: `${order.category} ${order.weight}`,
      status: RECYCLE_STATUS_LABEL[order.status],
      statusKey: order.status,
      amount: order.estimate,
    }
  }

  const order = findSalesOrder(orderId)
  if (!order) return undefined
  const first = order.lines[0]
  const product = first ? findProduct(first.productId) : undefined
  return {
    kind: 'sales',
    id: order.id,
    title: product && first ? `${product.name} ${first.spec}` : '投资金订单',
    status: SALES_STATUS_LABEL[order.status],
    statusKey: order.status,
    amount: salesTotal(order),
  }
}

function buildInitial(params: URLSearchParams) {
  if (params.get('demo') === 'chat') {
    return { session: createDemoChatSession(resolveOrderRef(params)), mode: 'demo' as ChatMode }
  }
  const stored = readSupportSession()
  if (stored && stored.stage !== 'closed') {
    return { session: stored, mode: 'live' as ChatMode }
  }
  const created = createSupportSession(resolveOrderRef(params))
  writeSupportSession(created)
  return { session: created, mode: 'live' as ChatMode }
}

/** 评审面板：直接展示指定会话阶段，不写回真实会话记录 */
function applyReviewStage(session: SupportSession, stage: string): SupportSession {
  if (stage === 'bot') return { ...session, stage: 'bot', servedBy: 'bot' }
  if (stage === 'agent') return { ...session, stage: 'agent', servedBy: 'agent' }
  if (stage === 'queue') {
    return {
      ...session,
      stage: 'queue',
      servedBy: 'bot',
      messages: [
        ...session.messages,
        supportSystemMessage('正在为您转接人工客服，当前排队 2 位，请稍候…'),
      ],
    }
  }
  return session
}

/** 在线会话：智能客服自动回复 → 排队转人工 → 会话结束进入评价 */
export function SupportChatPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initial = useRef(buildInitial(searchParams))
  const review = useReviewState('support.chat')
  const stageMode = review.values.stage ?? 'auto'
  const [session, setSession] = useState(() => applyReviewStage(initial.current.session, stageMode))
  /** 评审阶段为只读演示，切到 demo 模式避免写回真实会话 */
  const [mode] = useState<ChatMode>(stageMode === 'auto' ? initial.current.mode : 'demo')
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [endOpen, setEndOpen] = useState(false)

  const sessionRef = useRef(session)
  const modeRef = useRef(mode)
  modeRef.current = mode
  const timers = useRef<number[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  const commit = (next: SupportSession) => {
    sessionRef.current = next
    setSession(next)
    if (modeRef.current === 'live') writeSupportSession(next)
  }

  const append = (message: SupportMessage, patch?: Partial<SupportSession>) => {
    const prev = sessionRef.current
    commit({
      ...prev,
      ...patch,
      messages: [...prev.messages, message],
      updatedAt: Date.now(),
    })
  }

  const later = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay)
    timers.current.push(id)
  }

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id))
    },
    [],
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [session.messages.length, typing])

  const requestReply = (text: string) => {
    const stage = sessionRef.current.stage
    if (stage === 'bot') {
      setTyping(true)
      later(() => {
        setTyping(false)
        append(supportTextMessage('bot', botReply(text)))
      }, 700)
      return
    }
    if (stage === 'agent') {
      setTyping(true)
      later(() => {
        setTyping(false)
        append(supportTextMessage('agent', agentReply(text, sessionRef.current)))
      }, 1000)
    }
  }

  const sendText = (raw: string) => {
    const text = raw.trim()
    if (!text || sessionRef.current.stage === 'closed') return
    append(supportTextMessage('user', text))
    setInput('')
    requestReply(text)
  }

  const sendImage = () => {
    if (sessionRef.current.stage === 'closed') return
    append(supportImageMessage(images.photoOverallSample))
    const stage = sessionRef.current.stage
    if (stage === 'bot') {
      setTyping(true)
      later(() => {
        setTyping(false)
        append(
          supportTextMessage('bot', '已收到您上传的图片。如需人工核实图片内容，可以转人工客服。'),
        )
      }, 700)
    } else if (stage === 'agent') {
      setTyping(true)
      later(() => {
        setTyping(false)
        append(supportTextMessage('agent', '图片已收到，我这边帮您核实，请稍等。'))
      }, 900)
    }
  }

  const transfer = () => {
    if (sessionRef.current.stage !== 'bot') return
    append(supportSystemMessage('正在为您转接人工客服，当前排队 2 位，请稍候…'), { stage: 'queue' })
    later(() => {
      const prev = sessionRef.current
      commit({
        ...prev,
        stage: 'agent',
        servedBy: 'agent',
        updatedAt: Date.now(),
        messages: [
          ...prev.messages,
          supportSystemMessage('人工客服 小安 已接入'),
          supportTextMessage(
            'agent',
            '您好，我是人工客服小安，已查看您的会话记录。请描述需要协助的问题，我会尽快为您处理。',
          ),
        ],
      })
    }, 2400)
  }

  const endSession = () => {
    const prev = sessionRef.current
    const ended: SupportSession = {
      ...prev,
      stage: 'closed',
      updatedAt: Date.now(),
      messages: [...prev.messages, supportSystemMessage('会话已结束')],
    }
    sessionRef.current = ended
    setSession(ended)
    // 评价页按会话 ID 读取，演示会话也写入，保证结束 → 评价链路完整
    writeSupportSession(ended)
    setEndOpen(false)
    navigate(`${routePath('support.rate')}?session=${ended.id}`)
  }

  // 首页点击「没解决，问客服」时带上问题，进入会话即自动提问
  const sendRef = useRef(sendText)
  sendRef.current = sendText
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    const question = searchParams.get('q')
    if (question) sendRef.current(question)
  }, [searchParams])

  const statusText =
    session.stage === 'queue'
      ? '正在为您排队，前面还有 2 位'
      : session.stage === 'agent'
        ? '人工客服小安 · 在线'
        : session.stage === 'closed'
          ? '会话已结束'
          : '智能客服小安 · 7×24 在线'

  const dotClass =
    session.stage === 'queue'
      ? 'bg-warning'
      : session.stage === 'closed'
        ? 'bg-ink-400'
        : 'bg-success'

  const orderLink = (order: SupportOrderRef) =>
    order.kind === 'recycle'
      ? recycleOrderDetailPath(order.statusKey ?? 'review')
      : orderDetailPath(order.id)

  const footer = (
    <div className="flex items-end gap-2">
      <IconButton icon={ImageIcon} label="发送图片" variant="outline" onClick={sendImage} />
      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            sendText(input)
          }
        }}
        placeholder="请输入问题，人工客服 9:00–21:00"
        aria-label="输入消息"
        className="h-11 min-w-0 flex-1 rounded-full bg-surface-2 px-4 text-body text-foreground outline-none ring-1 ring-border placeholder:text-subtle-foreground focus:ring-primary"
      />
      <Button size="icon" aria-label="发送" onClick={() => sendText(input)}>
        <Send size={18} aria-hidden="true" />
      </Button>
    </div>
  )

  return (
    <DetailPage
      title="在线客服"
      right={
        session.stage !== 'closed' ? (
          <TextLink onClick={() => setEndOpen(true)}>结束会话</TextLink>
        ) : undefined
      }
      stickyBar={
        <div className="flex items-center justify-between gap-2 px-4 py-2">
          <div className="flex min-w-0 items-center gap-2 text-caption text-muted-foreground">
            <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />
            <span className="truncate">{statusText}</span>
          </div>
          {session.stage === 'bot' ? (
            <TextLink inline tone="primary" onClick={transfer}>
              转人工客服
            </TextLink>
          ) : null}
        </div>
      }
      footer={footer}
    >
      {session.messages.map((message) => (
        <MessageRow
          key={message.id}
          message={message}
          orderLink={orderLink}
          onNavigate={navigate}
        />
      ))}

      {typing ? (
        <div className="flex items-start gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Bot size={16} aria-hidden="true" />
          </span>
          <div className="animate-pulse rounded-lg rounded-tl-sm bg-card px-3 py-2 text-body text-subtle-foreground ring-1 ring-border-subtle">
            正在输入…
          </div>
        </div>
      ) : null}

      {session.stage === 'bot' ? (
        <div className="space-y-2 pt-1">
          <p className="text-caption text-subtle-foreground">你还可以问</p>
          <div className="flex flex-wrap gap-2">
            {SUPPORT_QUICK_QUESTIONS.map((question) => (
              <Chip key={question} onClick={() => sendText(question)}>
                {question}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      <div ref={bottomRef} />

      <BottomSheet
        open={endOpen}
        onClose={() => setEndOpen(false)}
        title="结束会话"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" block onClick={() => setEndOpen(false)}>
              继续咨询
            </Button>
            <Button block onClick={endSession}>
              结束并评价
            </Button>
          </div>
        }
      >
        <p className="text-body text-muted-foreground">
          结束后可以对本次客服服务进行评价，已发送的消息不会丢失。
        </p>
      </BottomSheet>
    </DetailPage>
  )
}

function MessageRow({
  message,
  orderLink,
  onNavigate,
}: {
  message: SupportMessage
  orderLink: (order: SupportOrderRef) => string
  onNavigate: (path: string) => void
}) {
  if (message.role === 'system') {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-surface-2 px-3 py-1 text-center text-caption text-subtle-foreground">
          {message.text}
        </span>
      </div>
    )
  }

  const mine = message.role === 'user'
  const Icon = message.role === 'agent' ? Headset : Bot
  const order = message.order

  return (
    <div className={`flex items-start gap-2 ${mine ? 'justify-end' : ''}`}>
      {mine ? null : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon size={16} aria-hidden="true" />
        </span>
      )}
      <div className={`max-w-xs ${mine ? 'text-right' : ''}`}>
        {message.type === 'order' && order ? (
          <div className="w-64 rounded-lg bg-card p-3 text-left ring-1 ring-border-subtle">
            <div className="flex items-center justify-between">
              <span className="text-caption text-subtle-foreground">关联订单</span>
              <span className="text-caption text-primary">{order.status}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-body-strong text-foreground">{order.title}</p>
            <p className="mt-1 text-caption tabular text-subtle-foreground">{order.id}</p>
            {order.amount ? (
              <p className="mt-1 text-body tabular text-price">¥{order.amount.toLocaleString()}</p>
            ) : null}
            <button
              type="button"
              onClick={() => onNavigate(orderLink(order))}
              className="mt-2 flex min-h-11 w-full items-center justify-between border-t border-border-subtle pt-2 text-body text-primary"
            >
              查看订单
              <ChevronRight size={16} className="text-icon-muted" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div
            className={
              mine
                ? 'inline-block rounded-lg rounded-tr-sm bg-primary px-3 py-2 text-left text-body text-primary-foreground'
                : 'inline-block rounded-lg rounded-tl-sm bg-card px-3 py-2 text-left text-body text-foreground ring-1 ring-border-subtle'
            }
          >
            {message.type === 'image' && message.image ? (
              <MediaVisual
                src={message.image}
                alt="会话图片"
                ratio="wide"
                className="h-40 w-52 rounded-md"
              />
            ) : (
              message.text
            )}
          </div>
        )}
        <p className="mt-1 text-micro text-subtle-foreground">{message.time}</p>
      </div>
    </div>
  )
}
