import {
  Badge,
  Button,
  Card,
  CountdownBar,
  DetailPage,
  EmptyState,
  TextLink,
  Toast,
} from '@/components'
import { Bell, CircleChevronRight, Gavel, Headset, Package, Radio, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import {
  DEMO_MESSAGES,
  MESSAGE_CATEGORIES,
  filterMessages,
  isMessageRead,
  markAllMessagesRead,
  markMessageRead,
  unreadCountByCategory,
  useMessageReadState,
  type MessageAction,
  type MessageCategory,
  type MessageFilter,
  type MessageItem,
} from '@/mocks/messages'
import { cn } from '@/lib/utils'
import { useReviewState } from '@/lib/useReviewState'
import { messageDetailPath } from '@/routes/paths'

/** 分类视觉：图标与强调色（UI 层，不进 mock） */
const CATEGORY_META: Record<MessageCategory, { icon: LucideIcon; tone: string }> = {
  order: { icon: Package, tone: 'text-info' },
  live: { icon: Radio, tone: 'text-violet' },
  quote: { icon: Gavel, tone: 'text-warning' },
  fund: { icon: Wallet, tone: 'text-gold-700' },
  service: { icon: Headset, tone: 'text-primary' },
  system: { icon: Bell, tone: 'text-muted-foreground' },
  alert: { icon: Bell, tone: 'text-price' },
}

/** 分类侧边栏项 */
function CategoryItem({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full flex-col items-center gap-1 rounded-md px-1 py-2 text-caption transition',
        active
          ? 'bg-price/10 text-price font-medium'
          : 'text-subtle-foreground active:bg-surface-2',
      )}
    >
      <span>{label}</span>
      {count > 0 ? (
        <span
          className={cn(
            'inline-flex min-w-[16px] items-center justify-center rounded-full px-1 text-micro leading-none',
            active ? 'bg-price text-paper' : 'bg-destructive text-paper',
          )}
        >
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </button>
  )
}

/** 金价提醒卡片（图2 模板：商品/目标金价/报价时间/温馨提示，按时间分节） */
function AlertMessageCard({
  message,
  read,
  onOpen,
  onAction,
}: {
  message: MessageItem
  read: boolean
  onOpen: (message: MessageItem) => void
  onAction: (action: MessageAction) => void
}) {
  const open = () => onOpen(message)
  const meta = CATEGORY_META.alert

  const price = message.alertTargetPrice
  const priceStr = price != null ? (price >= 100 ? price.toFixed(2) : price.toFixed(3)) : '--'

  return (
    <Card
      padding="md"
      role="link"
      tabIndex={0}
      aria-label={`${message.title}，${read ? '已读' : '未读'}`}
      onClick={open}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          open()
        }
      }}
      className={cn(
        'cursor-pointer space-y-2.5 transition active:bg-surface-2',
        read ? 'opacity-80' : '',
      )}
    >
      {/* 头部：图标 + 标题 + 未读点 + 时间 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-price/10">
            <meta.icon size={16} className={cn('shrink-0', meta.tone)} aria-hidden="true" />
          </div>
          <span
            className={cn(
              'truncate text-body-strong',
              read ? 'text-subtle-foreground' : 'text-foreground',
            )}
          >
            {message.title}
          </span>
          {!read ? (
            <span
              aria-hidden="true"
              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive"
            />
          ) : null}
        </div>
        <span className="shrink-0 text-caption text-subtle-foreground tabular">{message.time}</span>
      </div>

      {/* 金价提醒详情行 */}
      <div className="space-y-1.5 rounded-md bg-surface-2 px-3 py-2.5 text-caption">
        <DetailRow label="商品名称" value={message.alertProductName ?? '--'} />
        <DetailRow
          label="目标金价"
          value={`¥${priceStr} 元/克`}
          valueClassName="text-price font-medium"
        />
        <DetailRow
          label="报价时间"
          value={message.alertQuoteTime ?? '--'}
          valueClassName="tabular"
        />
        <DetailRow
          label="温馨提示"
          value={message.alertHint ?? message.summary}
          valueClassName="text-subtle-foreground"
        />
      </div>

      {/* 底部操作行 */}
      <div
        className="flex items-center justify-end gap-1"
        onClick={(event) => event.stopPropagation()}
      >
        {message.action ? (
          <Button size="sm" variant="secondary" onClick={() => onAction(message.action!)}>
            {message.action.label}
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1 text-caption text-primary">
            查看详情
            <CircleChevronRight size={14} />
          </span>
        )}
      </div>
    </Card>
  )
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-subtle-foreground">{label}</span>
      <span className={cn('text-right text-foreground', valueClassName)}>{value}</span>
    </div>
  )
}

/** 普通消息卡（保持原有模板，订单/检测/终价/资金/售后/系统） */
function MessageCard({
  message,
  read,
  onOpen,
  onAction,
}: {
  message: MessageItem
  read: boolean
  onOpen: (message: MessageItem) => void
  onAction: (action: MessageAction) => void
}) {
  const { remainMin } = message
  const [deadline] = useState(() => (remainMin != null ? Date.now() + remainMin * 60_000 : 0))
  const meta = CATEGORY_META[message.category]

  const open = () => onOpen(message)

  return (
    <Card
      padding="sm"
      role="link"
      tabIndex={0}
      aria-label={`${message.title}，${read ? '已读' : '未读'}`}
      onClick={open}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          open()
        }
      }}
      className="cursor-pointer space-y-2.5 transition active:bg-surface-2"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <meta.icon size={16} className={cn('shrink-0', meta.tone)} aria-hidden="true" />
          <span
            className={cn(
              'truncate text-body-strong',
              read ? 'text-subtle-foreground' : 'text-foreground',
            )}
          >
            {message.title}
          </span>
          {!read ? (
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {message.pinned ? (
            <Badge tone="warning" size="sm">
              置顶
            </Badge>
          ) : null}
          <span className="text-caption text-subtle-foreground">{message.time}</span>
        </div>
      </div>

      <p className="line-clamp-2 text-caption text-muted-foreground">{message.summary}</p>

      {remainMin != null ? (
        <CountdownBar
          deadline={deadline}
          prefix="确认剩余"
          tone={remainMin <= 10 ? 'danger' : 'warning'}
        />
      ) : null}

      {message.action ? (
        <div className="flex justify-end pt-0.5" onClick={(event) => event.stopPropagation()}>
          <Button size="sm" onClick={() => onAction(message.action!)}>
            {message.action.label}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

/** 金价提醒按时间分节（今天 17:03 / 16:56 这样的分组头） */
function groupAlertsByTime(items: MessageItem[]): { groupLabel: string; items: MessageItem[] }[] {
  const groups: Record<string, MessageItem[]> = {}
  items.forEach((m) => {
    // 从 time 字符串提取分节标签：去掉「今天/昨天/MM-DD」前缀，保留 HH:mm
    const match = m.time.match(/(\d{1,2}:\d{2})$/)
    const label = match ? match[1] : m.time
    if (!groups[label]) groups[label] = []
    groups[label].push(m)
  })
  return Object.entries(groups).map(([groupLabel, items]) => ({ groupLabel, items }))
}

/** 消息中心：左侧固定分类栏 + 右侧消息列表（图3 风格） */
export function MessagesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const storedState = useMessageReadState()
  const review = useReviewState('messages')
  const reviewFilter = review.values.filter ?? 'auto'
  const reviewRead = review.values.read ?? 'auto'

  /** 评审开关覆盖阅读状态：全部未读 / 全部已读，不写回本地存储 */
  const state =
    reviewRead === 'unread'
      ? { readMap: {} as Record<string, boolean> }
      : reviewRead === 'read'
        ? {
            readMap: Object.fromEntries(
              DEMO_MESSAGES.map((message) => [message.id, true]),
            ) as Record<string, boolean>,
          }
        : storedState

  // 分类筛选：评审面板优先，其次落到 URL
  const rawFilter = searchParams.get('filter')
  const filter: MessageFilter =
    reviewFilter !== 'auto'
      ? (reviewFilter as MessageFilter)
      : rawFilter === 'order' ||
          rawFilter === 'live' ||
          rawFilter === 'quote' ||
          rawFilter === 'fund' ||
          rawFilter === 'service' ||
          rawFilter === 'system' ||
          rawFilter === 'alert' ||
          rawFilter === 'all'
        ? rawFilter
        : 'all'

  const [toast, setToast] = useState<string | null>(null)

  const sidebarItems = MESSAGE_CATEGORIES.map((cat) => ({
    value: cat.value,
    label: cat.label,
    count: unreadCountByCategory(cat.value, state),
  }))

  const list = filterMessages(filter)
  const totalUnread = DEMO_MESSAGES.filter((message) => !isMessageRead(message.id, state)).length

  const handleAction = (action: MessageAction) => {
    if (action.to) {
      navigate(action.to)
    } else if (action.toast) {
      setToast(action.toast)
    }
  }

  const openMessage = (message: MessageItem) => {
    markMessageRead(message.id)
    navigate(message.orderLink ?? messageDetailPath(message.id))
  }

  const isAlertView = filter === 'alert' || filter === 'all'
  const alertOnly = filter === 'alert'

  return (
    <DetailPage
      title="消息中心"
      onBack={() => navigate(-1)}
      contentClassName="p-0"
      right={
        totalUnread > 0 ? (
          <TextLink
            tone="primary"
            onClick={() => {
              markAllMessagesRead()
              setToast('全部消息已标记为已读')
            }}
          >
            全部已读
          </TextLink>
        ) : null
      }
    >
      <div className="flex min-h-[50vh] bg-background">
        {/* 左侧固定分类栏（图3 风格） */}
        <aside className="sticky top-[var(--page-header-h)] flex w-20 shrink-0 flex-col gap-0.5 border-r border-border-subtle bg-surface">
          {sidebarItems.map((item) => (
            <CategoryItem
              key={item.value}
              label={item.label}
              count={item.count}
              active={filter === item.value}
              onClick={() => setSearchParams({ filter: item.value }, { replace: true })}
            />
          ))}
        </aside>

        {/* 右侧消息列表 */}
        <main className="min-w-0 flex-1 space-y-3 p-3">
          {list.length === 0 ? (
            <EmptyState icon={Bell} title="暂无消息" description="该分类下暂无消息通知。" />
          ) : alertOnly ? (
            // 纯金价提醒分类：按时间分节 + AlertMessageCard 模板
            groupAlertsByTime(list).map(({ groupLabel, items }) => (
              <section key={groupLabel}>
                <p className="mb-2 text-center text-caption text-subtle-foreground tabular">
                  {groupLabel}
                </p>
                <div className="space-y-2.5">
                  {items.map((m) => (
                    <AlertMessageCard
                      key={m.id}
                      message={m}
                      read={isMessageRead(m.id, state)}
                      onOpen={openMessage}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            // 全部/其他分类：混合渲染，alert 走 AlertMessageCard，其余走 MessageCard
            list.map((message) =>
              message.category === 'alert' ? (
                <AlertMessageCard
                  key={message.id}
                  message={message}
                  read={isMessageRead(message.id, state)}
                  onOpen={openMessage}
                  onAction={handleAction}
                />
              ) : (
                <MessageCard
                  key={message.id}
                  message={message}
                  read={isMessageRead(message.id, state)}
                  onOpen={openMessage}
                  onAction={handleAction}
                />
              ),
            )
          )}
        </main>
      </div>

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}
