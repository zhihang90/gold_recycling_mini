import { TabPage, Card, BottomSheet, Button, ProfileCard, QuickActionGrid } from '@/components'
import type { QuickAction } from '@/components'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Bell,
  CircleCheck,
  CircleChevronRight,
  CircleHelp,
  CreditCard,
  Headphones,
  MapPin,
  MessageSquare,
  Package,
  ScanLine,
  Truck,
  UserRound,
  Wallet,
  WalletCards,
} from 'lucide-react'

import { isMemberVerified, maskPhone, readMember } from '@/mocks/member'
import { DEMO_RECYCLE_ORDERS, type RecycleStatus } from '@/mocks/recycleOrders'
import { readSalesOrders, type SalesStatus } from '@/mocks/salesOrders'
import { messageUnreadCount, useMessageReadState } from '@/mocks/messages'
import { ordersFilterPath, paths } from '@/routes/paths'

/** 买金订单：销售订单的四个高频状态，不含自提；最后一格进入全部订单。 */
const SALES_SHORTCUTS: { key: SalesStatus | 'all'; label: string; icon: typeof Wallet }[] = [
  { key: 'pending-payment', label: '待付款', icon: Wallet },
  { key: 'pending-shipment', label: '待发货', icon: Package },
  { key: 'pending-receipt', label: '待收货', icon: Truck },
  { key: 'completed', label: '已完成', icon: CircleCheck },
  { key: 'all', label: '全部', icon: CircleChevronRight },
]

/** 回收订单：沿用回收流程的四个业务节点，最后一格进入全部订单。 */
const RECYCLE_SHORTCUTS: { key: RecycleStatus | 'all'; label: string; icon: typeof Wallet }[] = [
  { key: 'pending-ship', label: '待寄出', icon: Package },
  { key: 'testing', label: '检测中', icon: ScanLine },
  { key: 'pending-confirm', label: '待确认', icon: BadgeCheck },
  { key: 'pending-payment', label: '待打款', icon: WalletCards },
  { key: 'all', label: '全部', icon: CircleChevronRight },
]

/** 只给需要用户处理的节点显示角标，已完成与全部不打扰。 */
const BADGED_SALES: SalesStatus[] = ['pending-payment', 'pending-receipt']
const BADGED_RECYCLE: RecycleStatus[] = ['pending-confirm', 'pending-payment']

type InfoSheet = 'faq' | 'service' | null

const SHEET_TITLES: Record<Exclude<InfoSheet, null>, string> = {
  faq: '常见问题',
  service: '客服与投诉',
}

/** 个人中心：未登录引导登录，已登录展示订单状态、常用服务与账户入口。 */
export function MePage() {
  const navigate = useNavigate()
  const [member] = useState(() => readMember())
  const [infoSheet, setInfoSheet] = useState<InfoSheet>(null)
  const state = useMessageReadState()
  const unread = messageUnreadCount(state)
  const salesOrders = member ? readSalesOrders() : []
  const recycleOrders = member ? DEMO_RECYCLE_ORDERS : []
  const goLogin = () => navigate(paths.login)

  return (
    <TabPage>
      {member ? (
        <Card
          padding="md"
          className="-mx-4 rounded-none bg-gradient-to-br from-gold-800 to-gold-900 text-gold-50 shadow-none ring-0 transition active:brightness-95"
        >
          <div className="flex items-start justify-between">
            <button
              type="button"
              onClick={() => navigate(paths.meProfile)}
              className="flex w-[calc(100%-36px)] items-center gap-3 text-left"
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-800">
                <UserRound size={30} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-section text-gold-50">黄金用户</p>
                <p className="mt-1 text-body text-gold-50/80 tabular">{maskPhone(member.phone)}</p>
              </div>
            </button>

            {/* 用户卡右上角：消息中心铃铛（主入口，未读角标） */}
            <button
              type="button"
              onClick={() => navigate(paths.messages)}
              aria-label="消息中心"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-50/15 text-gold-50 transition active:bg-gold-50/25"
            >
              <MessageSquare size={18} aria-hidden="true" />
              {unread > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium leading-none text-destructive-foreground ring-1 ring-gold-900"
                >
                  {unread > 99 ? '99+' : unread}
                </span>
              ) : null}
            </button>
          </div>

          {/* 实名 pill 独立一行，右对齐 */}
          <div className="mt-3 flex justify-end">
            {isMemberVerified(member) ? (
              <span className="rounded-full bg-gold-50 px-2.5 py-1 text-caption-strong text-gold-800">
                已实名
              </span>
            ) : (
              <span className="rounded-full bg-destructive px-2.5 py-1 text-caption-strong text-destructive-foreground">
                未实名
              </span>
            )}
          </div>
        </Card>
      ) : (
        <ProfileCard
          title="登录 / 注册"
          description="登录后查看回收进度与收款记录"
          icon={UserRound}
          onClick={goLogin}
        />
      )}

      {/* 金价涨跌提醒入口（点击进入 market/alert-settings?tab=list） */}
      <Card padding="md" className="overflow-hidden">
        <button
          type="button"
          onClick={() => navigate(`${paths.marketAlertSettings}?tab=list`)}
          className="flex w-full items-center gap-3 text-left active:bg-surface-2"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-price/10 text-price">
            <Bell size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-body text-foreground">金价涨跌提醒</p>
            <p className="text-caption text-subtle-foreground">设置目标价，到价自动通知</p>
          </div>
          <CircleChevronRight size={16} className="shrink-0 text-icon-muted" />
        </button>
      </Card>

      <Card padding="md" className="space-y-3">
        <h2 className="text-card-title text-foreground">我的订单</h2>
        <OrderRow
          label="买金订单"
          items={SALES_SHORTCUTS.map((item) => ({
            key: item.key,
            label: item.label,
            icon: item.icon,
            badge: badgeCount(salesOrders, item.key, BADGED_SALES),
            onClick: member
              ? () => navigate(ordersFilterPath('sales', item.key))
              : goLogin,
          }))}
        />
        <div className="border-t border-border-subtle pt-3">
          <OrderRow
            label="回收订单"
            items={RECYCLE_SHORTCUTS.map((item) => ({
              key: item.key,
              label: item.label,
              icon: item.icon,
              badge: badgeCount(recycleOrders, item.key, BADGED_RECYCLE),
              onClick: member
                ? () => navigate(ordersFilterPath('recycle', item.key))
                : goLogin,
            }))}
          />
        </div>
      </Card>

      <Card padding="md">
        <h2 className="mb-2 text-card-title text-foreground">我的服务</h2>
        <QuickActionGrid
          columns={4}
          separateLast={false}
          items={[
            {
              key: 'address',
              label: '寄件地址',
              icon: MapPin,
              onClick: member ? () => navigate(paths.ship.addresses) : goLogin,
            },
            {
              key: 'account',
              label: '收款账户',
              icon: CreditCard,
              onClick: member ? () => navigate(paths.meAccounts) : goLogin,
            },
            {
              key: 'service',
              label: '联系客服',
              icon: Headphones,
              onClick: () => setInfoSheet('service'),
            },
            {
              key: 'faq',
              label: '常见问题',
              icon: CircleHelp,
              onClick: () => setInfoSheet('faq'),
            },
          ]}
        />
      </Card>

      <BottomSheet
        open={infoSheet !== null}
        onClose={() => setInfoSheet(null)}
        title={infoSheet ? SHEET_TITLES[infoSheet] : ''}
        footer={
          <Button block onClick={() => setInfoSheet(null)}>
            知道了
          </Button>
        }
      >
        {infoSheet === 'faq' ? (
          <div className="space-y-4">
            <section>
              <h3 className="text-body-strong text-foreground">可以回收哪些物品？</h3>
              <p className="mt-1 text-body text-muted-foreground">
                目前支持足金首饰、投资金条和金币。
              </p>
            </section>
            <section>
              <h3 className="text-body-strong text-foreground">预估价就是最终到账金额吗？</h3>
              <p className="mt-1 text-body text-muted-foreground">
                不是。最终到账金额以实物检测结果和您确认的报价为准。
              </p>
            </section>
            <section>
              <h3 className="text-body-strong text-foreground">不接受报价怎么办？</h3>
              <p className="mt-1 text-body text-muted-foreground">
                您可以选择退回；如对检测结果有疑问，也可以申请复检。
              </p>
            </section>
          </div>
        ) : null}

        {infoSheet === 'service' ? (
          <p className="text-body text-muted-foreground">
            可在回收单详情中联系客服，咨询报价、结算或退回问题。
          </p>
        ) : null}
      </BottomSheet>
    </TabPage>
  )
}

/** 一类订单的状态入口：标题 + 一行五格（最后一格为全部）。 */
function OrderRow({ label, items }: { label: string; items: QuickAction[] }) {
  return (
    <div>
      <p className="mb-1 text-caption text-subtle-foreground">{label}</p>
      <QuickActionGrid items={items} columns={5} />
    </div>
  )
}

/** 只为需要用户处理的节点计算角标，0 件时不显示。 */
function badgeCount<T extends string>(
  orders: { status: T }[],
  status: T | 'all',
  badged: readonly T[],
) {
  if (status === 'all' || !badged.includes(status)) return undefined
  return orders.filter((order) => order.status === status).length || undefined
}
