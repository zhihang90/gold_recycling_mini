import { TabPage, Card, ListItem, BottomSheet, Button, ProfileCard, QuickActionGrid } from '@/components'
import type { QuickAction } from '@/components'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  CircleCheck,
  CircleChevronRight,
  CircleHelp,
  CreditCard,
  Headphones,
  LogOut,
  MapPin,
  Package,
  ScanLine,
  Settings,
  ShieldCheck,
  Truck,
  UserRound,
  Wallet,
  WalletCards,
} from 'lucide-react'

import { clearMember, isMemberVerified, maskPhone, readMember } from '@/mocks/member'
import { DEMO_RECYCLE_ORDERS, type RecycleStatus } from '@/mocks/recycleOrders'
import { readSalesOrders, type SalesStatus } from '@/mocks/salesOrders'
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
  const salesOrders = member ? readSalesOrders() : []
  const recycleOrders = member ? DEMO_RECYCLE_ORDERS : []
  const goLogin = () => navigate(paths.login)

  const handleLogout = () => {
    clearMember()
    setMember(null)
    setInfoSheet(null)
  }

  return (
    <TabPage>
      {member ? (
        <Card
          padding="md"
          className="bg-gradient-to-br from-gold-800 to-gold-900 text-gold-50 shadow-none ring-0 transition active:brightness-95"
        >
          <button
            type="button"
            onClick={() => navigate(paths.meProfile)}
            className="block w-full text-left"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-800">
                <UserRound size={30} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-section text-gold-50">黄金用户</p>
                <p className="mt-1 text-body text-gold-50/80 tabular">{maskPhone(member.phone)}</p>
              </div>
              {isMemberVerified(member) ? (
                <span className="shrink-0 rounded-full bg-gold-50/20 px-2.5 py-1 text-caption text-gold-50">
                  已实名
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-destructive/20 px-2.5 py-1 text-caption text-gold-50">
                  未实名
                </span>
              )}
            </div>
            <p className="mt-3 border-t border-gold-50/20 pt-3 text-caption text-gold-50/80">
              买金与回收共用同一账户，订单与资金统一在这里管理。
            </p>
          </button>
        </Card>
      ) : (
        <ProfileCard
          title="登录 / 注册"
          description="登录后查看回收进度与收款记录"
          icon={UserRound}
          onClick={goLogin}
        />
      )}

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
                  onClick: () => navigate(paths.meAuth),
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
