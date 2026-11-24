import { TabPage, Card, BottomSheet, Button, ProfileCard, QuickActionGrid } from '@/components'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Bell,
  CircleChevronRight,
  CircleHelp,
  CreditCard,
  Headphones,
  MapPin,
  MessageSquare,
  ShieldCheck,
  UserRound,
  Wallet,
} from 'lucide-react'

import { getEnterpriseAuthStatus, maskPhone, readMember, readNickname } from '@/mocks/member'
import { DEMO_RECYCLE_ORDERS, type RecycleStatus } from '@/mocks/recycleOrders'
import { readSalesOrders, type SalesStatus } from '@/mocks/salesOrders'
import { messageUnreadCount, useMessageReadState } from '@/mocks/messages'
import { ordersFilterPath, paths, routePath } from '@/routes/paths'

type InfoSheet = 'faq' | null

const SHEET_TITLES: Record<Exclude<InfoSheet, null>, string> = {
  faq: '常见问题',
}

/**
 * 我的页面：头部账户卡 + 消息卡 + 业务与服务合并卡 + 关于我们入口。
 * 订单不再在卡片里展示每个状态，只给「买金订单」「回收订单」两个入口行，
 * 点进订单中心后再按状态筛选。
 */
export function MePage() {
  const navigate = useNavigate()
  const [member] = useState(() => readMember())
  const [infoSheet, setInfoSheet] = useState<InfoSheet>(null)
  const state = useMessageReadState()
  const unread = messageUnreadCount(state)
  const salesOrders = member ? readSalesOrders() : []
  const recycleOrders = member ? DEMO_RECYCLE_ORDERS : []
  const goLogin = () => navigate(paths.login)
  const personalVerified = Boolean(member?.realNameAuth?.verifiedAt)
  const enterpriseStatus = getEnterpriseAuthStatus(member)

  const salesPending = member
    ? salesOrders.filter((o) => o.status === 'pending-payment' || o.status === 'pending-receipt').length
    : 0
  const recyclePending = member
    ? recycleOrders.filter(
        (o) => o.status === 'pending-confirm' || o.status === 'pending-payment',
      ).length
    : 0

  return (
    <TabPage contentClassName={member ? 'pt-0' : undefined}>
      {member ? (
        <Card
          padding="md"
          className="-mx-4 rounded-none bg-gradient-to-br from-gold-800 to-gold-900 text-gold-50 shadow-none ring-0 transition active:brightness-95"
        >
          <div className="flex items-start justify-between">
            <button
              type="button"
              onClick={() => navigate(paths.meProfile)}
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-800">
                <UserRound size={30} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-section text-gold-50">{readNickname(member)}</p>
                  {enterpriseStatus === 'passed' ? (
                    <span className="rounded-full bg-gold-50 px-2.5 py-0.5 text-tiny font-medium text-gold-800">
                      企业已认证
                    </span>
                  ) : personalVerified ? (
                    <span className="rounded-full bg-gold-50 px-2.5 py-0.5 text-tiny font-medium text-gold-800">
                      个人已实名
                    </span>
                  ) : (
                    <span className="rounded-full bg-destructive px-2.5 py-0.5 text-tiny font-medium text-destructive-foreground">
                      未实名
                    </span>
                  )}
                </div>
                <p className="mt-1 text-body text-gold-50/80 tabular">{maskPhone(member.phone)}</p>
              </div>
            </button>
          </div>
        </Card>
      ) : (
        <ProfileCard title="登录 / 注册" icon={UserRound} onClick={goLogin} />
      )}

      {/* 消息中心 + 金价涨跌提醒 */}
      <Card padding="none" className="overflow-hidden">
        <button
          type="button"
          onClick={() => navigate(paths.messages)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-surface-2"
        >
          <MessageSquare size={20} className="shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-body text-foreground">我的消息</p>
          </div>
          <span className="shrink-0 text-caption text-subtle-foreground">
            {unread > 0 ? `${unread}条未读` : '暂无未读'}
          </span>
          <CircleChevronRight size={16} className="shrink-0 text-icon-muted" />
        </button>
        <div className="border-t border-border-subtle" />
        <button
          type="button"
          onClick={() => navigate(`${paths.marketAlertSettings}?tab=list`)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-surface-2"
        >
          <Bell size={20} className="shrink-0 text-price" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-body text-foreground">金价涨跌提醒</p>
          </div>
          <CircleChevronRight size={16} className="shrink-0 text-icon-muted" />
        </button>
      </Card>

      {/* 业务入口（订单 + 账户工具） */}
      <Card padding="none" className="overflow-hidden">
        <EntryRow
          icon={Wallet}
          iconTone="primary"
          title="我的订单"
          badge={salesPending + recyclePending > 0 ? salesPending + recyclePending : undefined}
          onClick={member ? () => navigate(paths.orders) : goLogin}
        />
        <div className="border-t border-border-subtle" />
        <EntryRow
          icon={ShieldCheck}
          iconTone="primary"
          title="实名认证"
          onClick={member ? () => navigate(paths.meProfile) : goLogin}
        />
        <div className="border-t border-border-subtle" />
        <EntryRow
          icon={MapPin}
          iconTone="price"
          title="寄件地址"
          onClick={member ? () => navigate(paths.ship.addresses) : goLogin}
        />
        <div className="border-t border-border-subtle" />
        <EntryRow
          icon={CreditCard}
          iconTone="success"
          title="收款账户"
          onClick={member ? () => navigate(paths.meAccounts) : goLogin}
        />
      </Card>

      {/* 常用服务：图标网格，无圆圈底色 */}
      <Card padding="md">
        <h2 className="mb-2 text-card-title text-foreground">常用服务</h2>
        <QuickActionGrid
          columns={4}
          separateLast={false}
          items={[
            {
              key: 'service',
              label: '在线客服',
              icon: Headphones,
              onClick: () => navigate(routePath('support.home')),
            },
            {
              key: 'faq',
              label: '常见问题',
              icon: CircleHelp,
              onClick: () => setInfoSheet('faq'),
            },
            {
              key: 'about',
              label: '关于我们',
              icon: BadgeCheck,
              onClick: () => navigate(paths.meAbout),
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
      </BottomSheet>
    </TabPage>
  )
}

/** 卡片内统一的「图标 + 标题 + 角标 / 右箭头」入口行；图标直接用语义色前景，无圆圈背景。 */
type Tone = 'primary' | 'price' | 'success' | 'gold'
const TONE_FG: Record<Tone, string> = {
  primary: 'text-primary',
  price: 'text-price',
  success: 'text-success',
  gold: 'text-gold-700',
}

function EntryRow({
  icon: Icon,
  iconTone,
  title,
  badge,
  onClick,
}: {
  icon: typeof Wallet
  iconTone: Tone
  title: string
  badge?: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-surface-2"
    >
      <Icon size={20} className={`shrink-0 ${TONE_FG[iconTone]}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-body text-foreground">{title}</p>
      </div>
      {badge != null ? (
        <span className="shrink-0 rounded-full bg-destructive px-2 py-0.5 text-tiny text-destructive-foreground tabular">
          {badge}
        </span>
      ) : null}
      <CircleChevronRight size={16} className="shrink-0 text-icon-muted" />
    </button>
  )
}
