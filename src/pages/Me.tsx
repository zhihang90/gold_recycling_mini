import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  CircleCheck,
  CircleHelp,
  CreditCard,
  Headphones,
  LogOut,
  MapPin,
  Package,
  ScanLine,
  Settings,
  ShieldCheck,
  UserRound,
  WalletCards,
} from 'lucide-react'
import { TabPage } from '@/components/TabPage'
import { Card } from '@/components/Card'
import { ListItem } from '@/components/ListItem'
import { BottomSheet } from '@/components/BottomSheet'
import { Button } from '@/components/Button'
import { ProfileCard } from '@/components/ProfileCard'
import { QuickActionGrid } from '@/components/QuickActionGrid'
import { TextLink } from '@/components/TextLink'
import { clearMember, maskPhone, readMember } from '@/mocks/member'
import { paths } from '@/routes/paths'

const GUEST_ORDER_SHORTCUTS = [
  { key: 'shipping', label: '待寄出', icon: Package },
  { key: 'confirm', label: '待确认', icon: BadgeCheck },
  { key: 'paying', label: '待打款', icon: WalletCards },
  { key: 'done', label: '已完成', icon: CircleCheck },
]

const MEMBER_ORDER_SHORTCUTS = [
  { key: 'shipping', label: '待寄出', icon: Package },
  { key: 'testing', label: '检测中', icon: ScanLine },
  { key: 'confirm', label: '待确认', icon: BadgeCheck },
  { key: 'paying', label: '待打款', icon: WalletCards },
]

type InfoSheet = 'faq' | 'service' | 'account' | 'identity' | 'privacy' | 'logout' | null

const SHEET_TITLES: Record<Exclude<InfoSheet, null>, string> = {
  faq: '常见问题',
  service: '客服与投诉',
  account: '收款账户',
  identity: '实名认证',
  privacy: '隐私设置',
  logout: '退出登录',
}

/** 个人中心：未登录引导登录，已登录展示订单状态、常用服务与账户入口。 */
export function MePage() {
  const navigate = useNavigate()
  const [member, setMember] = useState(() => readMember())
  const [infoSheet, setInfoSheet] = useState<InfoSheet>(null)
  const goLogin = () => navigate(paths.login)
  const goOrders = () => navigate(paths.orders)

  const handleLogout = () => {
    clearMember()
    setMember(null)
    setInfoSheet(null)
  }

  return (
    <TabPage>
      {member ? (
        <Card padding="md" className="bg-accent shadow-none ring-0">
          <div className="flex items-center gap-3">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-card text-accent-foreground ring-1 ring-border-subtle">
              <UserRound size={30} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-section text-foreground">黄金用户</p>
              <p className="mt-1 text-body text-ink-700 tabular">{maskPhone(member.phone)}</p>
            </div>
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

      <Card padding="md">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-card-title text-foreground">我的订单</h2>
          <TextLink onClick={member ? goOrders : goLogin} showArrow>
            查看全部
          </TextLink>
        </div>
        <QuickActionGrid
          items={(member ? MEMBER_ORDER_SHORTCUTS : GUEST_ORDER_SHORTCUTS).map((item) => ({
            ...item,
            onClick: member ? goOrders : goLogin,
          }))}
        />
      </Card>

      {member ? (
        <>
          <Card padding="md">
            <h2 className="mb-2 text-card-title text-foreground">我的服务</h2>
            <QuickActionGrid
              items={[
                {
                  key: 'address',
                  label: '寄件地址',
                  icon: MapPin,
                  onClick: () => navigate(paths.ship.addresses),
                },
                {
                  key: 'account',
                  label: '收款账户',
                  icon: CreditCard,
                  onClick: () => setInfoSheet('account'),
                },
                {
                  key: 'identity',
                  label: '实名认证',
                  icon: ShieldCheck,
                  onClick: () => setInfoSheet('identity'),
                },
                {
                  key: 'service',
                  label: '联系客服',
                  icon: Headphones,
                  onClick: () => setInfoSheet('service'),
                },
              ]}
            />
          </Card>

          <Card className="overflow-hidden">
            <ListItem
              title="常见问题"
              icon={CircleHelp}
              showArrow
              divider
              onClick={() => setInfoSheet('faq')}
            />
            <ListItem
              title="客服与投诉"
              icon={Headphones}
              showArrow
              divider
              onClick={() => setInfoSheet('service')}
            />
            <ListItem
              title="隐私设置"
              icon={Settings}
              showArrow
              divider
              onClick={() => setInfoSheet('privacy')}
            />
            <ListItem
              title="退出登录"
              icon={LogOut}
              onClick={() => setInfoSheet('logout')}
            />
          </Card>
        </>
      ) : (
        <>
          <Card className="overflow-hidden">
            <ListItem title="收款账户" icon={CreditCard} showArrow divider onClick={goLogin} />
            <ListItem title="实名认证" icon={ShieldCheck} showArrow divider onClick={goLogin} />
            <ListItem title="寄件地址" icon={MapPin} showArrow onClick={goLogin} />
          </Card>

          <Card className="overflow-hidden">
            <ListItem
              title="常见问题"
              icon={CircleHelp}
              showArrow
              divider
              onClick={() => setInfoSheet('faq')}
            />
            <ListItem
              title="客服与投诉"
              icon={Headphones}
              showArrow
              divider
              onClick={() => setInfoSheet('service')}
            />
            <ListItem title="隐私设置" icon={Settings} showArrow onClick={goLogin} />
          </Card>
        </>
      )}

      <BottomSheet
        open={infoSheet !== null}
        onClose={() => setInfoSheet(null)}
        title={infoSheet ? SHEET_TITLES[infoSheet] : ''}
        footer={
          infoSheet === 'logout' ? (
            <div className="flex gap-3">
              <Button variant="secondary" block onClick={() => setInfoSheet(null)}>
                取消
              </Button>
              <Button block onClick={handleLogout}>
                退出登录
              </Button>
            </div>
          ) : (
            <Button block onClick={() => setInfoSheet(null)}>
              知道了
            </Button>
          )
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

        {infoSheet === 'account' ? (
          <p className="text-body text-muted-foreground">
            收款账户在完成实名认证后绑定，回收款将打款至该账户；具体到账时间以订单进度为准。
          </p>
        ) : null}

        {infoSheet === 'identity' ? (
          <p className="text-body text-muted-foreground">
            按监管要求，寄件回收需完成实名认证。进入回收流程后，按页面提示上传证件即可。
          </p>
        ) : null}

        {infoSheet === 'privacy' ? (
          <div className="space-y-3 text-body text-muted-foreground">
            <p>我们仅在提供回收服务所必需的范围内使用您的信息。</p>
            <p>如需注销账户或撤回授权，可联系客服处理。</p>
          </div>
        ) : null}

        {infoSheet === 'logout' ? (
          <p className="text-body text-muted-foreground">
            退出后需重新登录才能查看订单与收款信息。
          </p>
        ) : null}
      </BottomSheet>
    </TabPage>
  )
}
