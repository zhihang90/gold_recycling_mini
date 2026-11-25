import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DetailPage,
  PriceSubscribeSheet,
  TextLink,
} from '@/components'
import {
  SUBSCRIBE_FLUCTUATION_HELP,
  SUBSCRIBE_NOTE,
  clearPriceSubscription,
  readPriceSubscription,
} from '@/mocks/market'
import { BellRing } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * 金价提醒：只保留一步订阅（涨跌提醒 + 目标金价），
 * 复杂的商品切换、推送时机、勿扰时间等设置已下线，统一在订阅弹层内完成。
 */
export function MarketAlertSettingsPage() {
  const [params] = useSearchParams()
  const [open, setOpen] = useState(params.get('action') === 'subscribe')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [subscription, setSubscription] = useState(() => readPriceSubscription())

  return (
    <DetailPage title="价格提醒">
      <Card padding="md" className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gold-50 text-gold-700">
            <BellRing size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-card-title text-foreground">金价提醒</p>
              {subscription ? <Badge tone="gold">已开启</Badge> : null}
            </div>
            <p className="mt-1 text-caption text-subtle-foreground">
              {subscription
                ? `目标金价 ${subscription.targetPrice.toFixed(2)} 元/克，到达或金价异动时通知你`
                : '金价异动或到达目标价时，通过服务通知提醒你'}
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-md bg-surface-2 px-3 py-2.5">
          <div className="flex items-baseline justify-between text-caption">
            <span className="text-subtle-foreground">涨跌提醒</span>
            <span className="text-foreground">{subscription ? '已开启' : '未开启'}</span>
          </div>
          <div className="flex items-baseline justify-between text-caption">
            <span className="text-subtle-foreground">目标金价</span>
            <span className="tabular text-foreground">
              {subscription ? `${subscription.targetPrice.toFixed(2)} 元/克` : '--'}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-caption">
            <span className="text-subtle-foreground">提醒方式</span>
            <span className="text-foreground">服务通知</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={() => setOpen(true)}>
            {subscription ? '管理订阅' : '订阅提醒'}
          </Button>
          {subscription ? (
            <div className="text-center">
              <TextLink tone="muted" onClick={() => setCancelOpen(true)}>
                取消订阅
              </TextLink>
            </div>
          ) : null}
        </div>
      </Card>

      <Card padding="md" className="space-y-2">
        <p className="text-body-strong text-foreground">提醒说明</p>
        <p className="text-caption leading-relaxed text-subtle-foreground">
          {SUBSCRIBE_FLUCTUATION_HELP}
        </p>
        <p className="text-caption leading-relaxed text-subtle-foreground">{SUBSCRIBE_NOTE}</p>
      </Card>

      <PriceSubscribeSheet
        open={open}
        onClose={() => setOpen(false)}
        onChanged={() => setSubscription(readPriceSubscription())}
      />

      <ConfirmDialog
        open={cancelOpen}
        title="取消订阅"
        description="取消后将无法收到消息通知，确认要取消订阅吗？"
        cancelText="暂不取消"
        confirmText="取消订阅"
        tone="danger"
        onConfirm={() => {
          clearPriceSubscription()
          setSubscription(null)
          setCancelOpen(false)
        }}
        onClose={() => setCancelOpen(false)}
      />
    </DetailPage>
  )
}
