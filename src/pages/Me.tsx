import {
  TabPage,
  Badge,
  Card,
  BottomSheet,
  Button,
  ProfileCard,
  QuickActionGrid,
} from '@/components'
import { useState } from 'react'
import type { ReactNode } from 'react'
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

import {
  getEnterpriseAuthStatus,
  maskPhone,
  readMember,
  readMemberLevel,
  readNickname,
  type EnterpriseAuthStatus,
  type Member,
} from '@/mocks/member'
import { useReviewState } from '@/lib/useReviewState'
import { messageUnreadCount, useMessageReadState } from '@/mocks/messages'
import { ordersFilterPath, paths, routePath } from '@/routes/paths'

type InfoSheet = 'faq' | null

const SHEET_TITLES: Record<Exclude<InfoSheet, null>, string> = {
  faq: '常见问题',
}

/** 评审「已登录」但本地没有登录态时使用的演示账户 */
const REVIEW_MEMBER: Member = {
  phone: '13800138000',
  loginAt: 1,
  realNameAuth: { name: '张三', idNo: '440300199001011234', verifiedAt: 1 },
  customerType: 'individual',
}

/**
 * 我的页面：头部账户卡 + 消息卡 + 业务与服务合并卡 + 关于我们入口。
 * 订单不再在卡片里展示每个状态，只给「买金订单」「回收订单」两个入口行，
 * 点进订单中心后再按状态筛选。
 */
export function MePage() {
  const navigate = useNavigate()
  const [storedMember] = useState(() => readMember())
  const [infoSheet, setInfoSheet] = useState<InfoSheet>(null)
  const review = useReviewState('me')
  const accountMode = review.values.account ?? 'auto'
  const verifyMode = review.values.verify ?? 'auto'

  /** 评审开关只覆盖展示分支，不改写本地登录数据 */
  const member =
    accountMode === 'guest'
      ? null
      : accountMode === 'member'
        ? (storedMember ?? REVIEW_MEMBER)
        : storedMember

  const state = useMessageReadState()
  const unread = messageUnreadCount(state)
  const goLogin = () => navigate(paths.login)
  const level = readMemberLevel()
  const personalVerified =
    verifyMode === 'auto' ? Boolean(member?.realNameAuth?.verifiedAt) : verifyMode === 'personal'
  const enterpriseStatus: EnterpriseAuthStatus =
    verifyMode === 'auto'
      ? getEnterpriseAuthStatus(member)
      : verifyMode === 'enterprise'
        ? 'passed'
        : 'unstarted'

  return (
    <TabPage contentClassName={member ? 'pt-0' : undefined}>
      {member ? (
        <Card
          padding="md"
          className="-mx-4 rounded-none bg-gradient-to-br from-gold-800 to-gold-900 text-gold-50 shadow-none ring-0 transition active:brightness-95"
        >
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(paths.meProfile)}
              className="flex min-w-0 items-center gap-3 text-left"
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-800">
                <UserRound size={30} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-section text-gold-50">{readNickname(member)}</p>
                <p className="mt-1 text-body text-gold-50/80 tabular">{maskPhone(member.phone)}</p>
              </div>
            </button>

            {/* 会员等级标签：注册登录即普通会员，点击查看等级说明 */}
            <button
              type="button"
              onClick={() => navigate(paths.meMemberLevel)}
              className="mt-1 shrink-0 rounded-full bg-gold-50/10 px-2.5 py-1 text-caption text-gold-50 ring-1 ring-gold-50/25 transition active:bg-gold-50/20"
            >
              {level.name}
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
          onClick={member ? () => navigate(paths.orders) : goLogin}
        />
        <div className="border-t border-border-subtle" />
        <EntryRow
          icon={ShieldCheck}
          iconTone="primary"
          title="实名认证"
          trailing={
            enterpriseStatus === 'passed' || personalVerified ? (
              <Badge tone="gold">
                {enterpriseStatus === 'passed' ? '企业已认证' : '个人已实名'}
              </Badge>
            ) : (
              <Badge tone="danger">未实名</Badge>
            )
          }
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

/** 卡片内统一的「图标 + 标题 + 右侧附加信息 + 右箭头」入口行；图标直接用语义色前景，无圆圈背景。 */
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
  trailing,
  onClick,
}: {
  icon: typeof Wallet
  iconTone: Tone
  title: string
  trailing?: ReactNode
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
      {trailing}
      <CircleChevronRight size={16} className="shrink-0 text-icon-muted" />
    </button>
  )
}
