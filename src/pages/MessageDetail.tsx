import { Badge, Button, Card, DetailPage, EmptyState, KeyValueRow, TextLink, Toast } from '@/components'
import { Bell, Gavel, Headset, Package, Radio, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  MESSAGE_CATEGORIES,
  getMessageById,
  markMessageRead,
  type MessageAction,
  type MessageCategory,
} from '@/mocks/messages'

/** 与消息中心保持一致的分类视觉 */
const CATEGORY_META: Record<MessageCategory, { icon: LucideIcon; tone: string }> = {
  order: { icon: Package, tone: 'text-info' },
  live: { icon: Radio, tone: 'text-violet' },
  quote: { icon: Gavel, tone: 'text-warning' },
  fund: { icon: Wallet, tone: 'text-gold-700' },
  service: { icon: Headset, tone: 'text-primary' },
  system: { icon: Bell, tone: 'text-muted-foreground' },
  alert: { icon: Bell, tone: 'text-price' },
}

/** 消息详情：进详情即标记已读，主按钮直达业务页，次要入口查看关联订单 / 联系客服 */
export function MessageDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const message = id ? getMessageById(id) : undefined

  // 进入详情即标记已读（V1.3 P-27 规则）
  useEffect(() => {
    if (message) markMessageRead(message.id)
  }, [message])

  const handleAction = (action: MessageAction) => {
    if (action.to) {
      navigate(action.to)
    } else if (action.toast) {
      setToast(action.toast)
    }
  }

  if (!message) {
    return (
      <DetailPage title="消息详情" onBack={() => navigate(-1)}>
        <EmptyState
          icon={Bell}
          title="消息不存在"
          description="该消息可能已被删除，或链接无效。"
        />
      </DetailPage>
    )
  }

  const meta = CATEGORY_META[message.category]
  const categoryLabel = MESSAGE_CATEGORIES.find((c) => c.value === message.category)?.label
  const action = message.detailAction

  return (
    <DetailPage
      title="消息详情"
      onBack={() => navigate(-1)}
      footer={
        <div className="space-y-2">
          {action ? (
            action.disabledNote ? (
              <>
                <Button size="lg" block disabled>
                  {action.label}
                </Button>
                <p className="text-center text-caption text-subtle-foreground">
                  {action.disabledNote}
                </p>
              </>
            ) : (
              <Button size="lg" block onClick={() => handleAction(action)}>
                {action.label}
              </Button>
            )
          ) : null}
          <div className="flex items-center justify-center gap-6">
            {message.orderLink ? (
              <TextLink tone="muted" onClick={() => navigate(message.orderLink!)}>
                查看关联订单
              </TextLink>
            ) : null}
            <TextLink
              tone="muted"
              onClick={() => setToast('已为您接入在线客服，将在 9:00–21:00 回复')}
            >
              联系客服
            </TextLink>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <meta.icon size={18} className={meta.tone} aria-hidden="true" />
          {categoryLabel ? <Badge tone="muted" size="sm">{categoryLabel}</Badge> : null}
          <span className="text-caption text-subtle-foreground">{message.time}</span>
        </div>

        <h1 className="text-card-title text-foreground">{message.title}</h1>

        <p className="text-body leading-relaxed text-muted-foreground">{message.content}</p>

        {message.orderId ? (
          <Card padding="sm">
            <KeyValueRow label="关联订单" value={message.orderId} emphasis />
          </Card>
        ) : null}
      </div>

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}
