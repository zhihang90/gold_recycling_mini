import { Badge, Button, Card, CountdownBar, DetailPage, EmptyState, SegmentedTabs, TextLink, Toast } from '@/components'
import { Bell, Gavel, Headset, Package, Radio, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import {
  MESSAGE_CATEGORIES,
  filterMessages,
  isMessageRead,
  markAllMessagesRead,
  markMessageRead,
  messageUnreadCount,
  unreadCountByCategory,
  useMessageReadState,
  type MessageAction,
  type MessageCategory,
  type MessageFilter,
  type MessageItem,
} from '@/mocks/messages'
import { cn } from '@/lib/utils'
import { messageDetailPath } from '@/routes/paths'

/** 分类视觉：图标与强调色（UI 层，不进 mock） */
const CATEGORY_META: Record<MessageCategory, { icon: LucideIcon; tone: string }> = {
  order: { icon: Package, tone: 'text-info' },
  live: { icon: Radio, tone: 'text-violet' },
  quote: { icon: Gavel, tone: 'text-warning' },
  fund: { icon: Wallet, tone: 'text-gold-700' },
  service: { icon: Headset, tone: 'text-primary' },
  system: { icon: Bell, tone: 'text-muted-foreground' },
}

/** 单条消息卡：独立组件以便为倒计时维护稳定的 deadline 状态 */
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
  // deadline 只在挂载时算一次，避免每次渲染漂移（与订单列表倒计时一致）
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
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive"
            />
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {message.pinned ? (
            <Badge tone="warning" size="sm">置顶</Badge>
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
        <div
          className="flex justify-end pt-0.5"
          onClick={(event) => event.stopPropagation()}
        >
          <Button size="sm" onClick={() => onAction(message.action!)}>
            {message.action.label}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

/** 消息中心：关键交易信息的可追溯收件箱（spec U-23 / A-14~16，信息架构 P-26 / P-27） */
export function MessagesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const state = useMessageReadState()
  // 分类筛选落到 URL：消息详情返回后可还原，非法值回退「全部」
  const rawFilter = searchParams.get('filter')
  const filter: MessageFilter =
    rawFilter === 'order' ||
    rawFilter === 'live' ||
    rawFilter === 'quote' ||
    rawFilter === 'fund' ||
    rawFilter === 'service' ||
    rawFilter === 'system' ||
    rawFilter === 'all'
      ? rawFilter
      : 'all'
  const [toast, setToast] = useState<string | null>(null)

  const items = MESSAGE_CATEGORIES.map((cat) => ({
    value: cat.value,
    label: cat.label,
    count: unreadCountByCategory(cat.value, state),
  }))
  const list = filterMessages(filter)
  const totalUnread = messageUnreadCount(state)

  const handleAction = (action: MessageAction) => {
    if (action.to) {
      navigate(action.to)
    } else if (action.toast) {
      setToast(action.toast)
    }
  }

  /** 订单相关消息直达对应订单详情；仅无关联订单的系统通知进入消息详情 */
  const openMessage = (message: MessageItem) => {
    markMessageRead(message.id)
    navigate(message.orderLink ?? messageDetailPath(message.id))
  }

  return (
    <DetailPage
      title="消息中心"
      onBack={() => navigate(-1)}
      contentClassName="space-y-3"
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
      stickyBar={
        <div className="px-4 py-2">
          <SegmentedTabs
            items={items}
            value={filter}
            onChange={(value) => setSearchParams({ filter: value }, { replace: true })}
            variant="underline"
            className="border-b-0"
          />
        </div>
      }
    >
      {list.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="暂无消息"
          description="该分类下暂无消息通知。"
        />
      ) : (
        list.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            read={isMessageRead(message.id, state)}
            onOpen={openMessage}
            onAction={handleAction}
          />
        ))
      )}

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}
