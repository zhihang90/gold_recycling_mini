import { BottomSheet, Button, Card, DetailPage, EmptyState, SegmentedTabs } from '@/components'
import { useLiveGoldPrice } from '@/hooks/useLiveGoldPrice'
import { cn } from '@/lib/utils'
import { round2 } from '@/lib/money'
import {
  HOLDINGS_BALANCE,
  HOLDINGS_LEDGER,
  HOLDINGS_LOTS,
  holdingsOverview,
  type LedgerScene,
} from '@/mocks/holdings'
import { Info, MinusCircle, PlusCircle, Recycle, RotateCcw, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useReviewState } from '@/lib/useReviewState'
import { paths } from '@/routes/paths'

type AssetTab = 'purchase' | 'flow'

/** 资金流水场景图标与状态底色 */
const LEDGER_ICON: Record<LedgerScene, typeof ShoppingBag> = {
  purchase: ShoppingBag,
  recharge: PlusCircle,
  withdraw: MinusCircle,
  recycle: Recycle,
  refund: RotateCcw,
}

const LEDGER_TONE_CLASS: Record<'success' | 'warning' | 'muted' | 'danger', string> = {
  success: 'text-success',
  warning: 'text-warning',
  muted: 'text-subtle-foreground',
  danger: 'text-destructive',
}

/**
 * 我的资产：金色概览 + 账户余额 + 购金记录 / 资金流水。
 * 从首页「我的购金」进入，需登录后访问。
 */
export function HoldingsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<AssetTab>('purchase')
  const review = useReviewState('me.holdings')
  const reviewTab = review.values.tab
  /** 评审面板切空态时，购金记录与资金流水同时为空 */
  const dataEmpty = review.values.data === 'empty'

  // 评审面板切换页签时同步当前视图
  useEffect(() => {
    if (reviewTab === 'purchase' || reviewTab === 'flow') setTab(reviewTab)
  }, [reviewTab])
  const [ruleOpen, setRuleOpen] = useState(false)
  const [totalOpen, setTotalOpen] = useState(false)
  const livePrice = useLiveGoldPrice()
  const overview = holdingsOverview()
  /** 预估总价 = 总克重 × 上金所实时金价；预估收益 = 预估总价 - 购入总价 */
  const estValue = round2(overview.grams * livePrice)
  const estProfit = round2(estValue - overview.cost)
  const estProfitRate = overview.cost > 0 ? (estProfit / overview.cost) * 100 : 0
  const totalAssets = round2(HOLDINGS_BALANCE + estValue)

  return (
    <DetailPage title="我的资产">
      {/* 总资产：账户余额 + 预估总价；充值/提现仅作用于账户余额 */}
      <div className="-mx-4 -mt-4 bg-gradient-to-b from-gold-600 to-gold-700 px-4 pt-4 pb-5 text-gold-50">
        <div className="flex items-center gap-1">
          <p className="text-caption text-gold-50/75">总资产(元)</p>
          <button
            type="button"
            aria-label="查看总资产计算说明"
            onClick={() => setTotalOpen(true)}
            className="inline-flex text-gold-50/60 transition active:opacity-60"
          >
            <Info size={12} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1 flex items-baseline gap-1">
          <span className="text-body font-medium">¥</span>
          <span className="text-display tabular">{totalAssets.toFixed(2)}</span>
        </p>

        <div className="mt-4 border-t border-white/15 pt-3">
          <p className="text-micro text-gold-50/70">账户余额（可提现）</p>
          <p className="mt-0.5 text-card-title tabular">{HOLDINGS_BALANCE.toFixed(2)}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(paths.meRecharge)}>
              <PlusCircle size={14} aria-hidden="true" />
              充值
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(paths.meWithdraw)}>
              <MinusCircle size={14} aria-hidden="true" />
              提现
            </Button>
          </div>
        </div>
      </div>

      {/* 预估总价：持仓市值，附计算口径说明；购金入口贴近持仓 */}
      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-caption text-subtle-foreground">预估总价(元)</span>
              <button
                type="button"
                aria-label="查看预估总价计算说明"
                onClick={() => setRuleOpen(true)}
                className="inline-flex text-subtle-foreground transition active:opacity-60"
              >
                <Info size={12} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1 text-section tabular text-foreground">{estValue.toFixed(2)}</p>
          </div>
          <Button size="sm" onClick={() => navigate(paths.buy)}>
            去购金
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-border-subtle pt-3 text-center">
          <div>
            <p className="text-micro text-subtle-foreground">总克重</p>
            <p className="mt-0.5 text-body-strong tabular text-foreground">{overview.grams}克</p>
          </div>
          <div>
            <p className="text-micro text-subtle-foreground">购入总价</p>
            <p className="mt-0.5 text-body-strong tabular text-foreground">
              {overview.cost.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-micro text-subtle-foreground">预估收益</p>
            <p className="mt-0.5 text-body-strong tabular text-price">
              {estProfit >= 0 ? '+' : '-'}
              {Math.abs(estProfit).toFixed(2)}
              <span className="ml-1 text-micro text-subtle-foreground">
                {estProfit >= 0 ? '+' : '-'}
                {Math.abs(estProfitRate).toFixed(2)}%
              </span>
            </p>
          </div>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <SegmentedTabs
          items={[
            { value: 'purchase', label: '购金记录' },
            { value: 'flow', label: '资金流水' },
          ]}
          value={tab}
          onChange={(value) => setTab(value as AssetTab)}
          variant="underline"
          fill
          className="bg-card px-3"
        />

        {tab === 'purchase' ? (
          dataEmpty ? (
            <div className="p-3">
              <EmptyState title="暂无购金记录" description="买入金条后，这里会展示每笔购金与收益" />
            </div>
          ) : (
            <div className="space-y-2.5 p-3">
              {HOLDINGS_LOTS.map((lot) => {
                const lotValue = round2(lot.grams * livePrice)
                const lotProfit = round2(lotValue - lot.cost)
                return (
                  <div key={lot.id} className="rounded-md bg-surface-2 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-body-strong text-foreground">{lot.name}</p>
                        <p className="mt-0.5 text-micro tabular text-subtle-foreground">
                          {lot.boughtAt}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-sm bg-gold-50 px-1.5 py-0.5 text-micro tabular text-gold-700 ring-1 ring-gold-200">
                        {lot.spec}
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-3 gap-2 border-t border-border-subtle pt-2.5 text-center">
                      <div>
                        <p className="text-micro text-subtle-foreground">购入总价</p>
                        <p className="mt-0.5 text-body-strong tabular text-foreground">
                          {lot.cost.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-micro text-subtle-foreground">预估总价</p>
                        <p className="mt-0.5 text-body-strong tabular text-success">
                          {lotValue.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-micro text-subtle-foreground">预估收益</p>
                        <p className="mt-0.5 text-body-strong tabular text-price">
                          {lotProfit >= 0 ? '+' : '-'}
                          {Math.abs(lotProfit).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : dataEmpty ? (
          <div className="p-3">
            <EmptyState title="暂无资金流水" description="充值、提现与交易记录将在这里展示" />
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {HOLDINGS_LEDGER.map((entry) => {
              const Icon = LEDGER_ICON[entry.scene]
              const income = entry.amount > 0
              return (
                <div key={entry.id} className="flex items-start gap-3 px-3 py-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body text-foreground">{entry.title}</p>
                    <p className="mt-0.5 truncate text-micro text-subtle-foreground">
                      {entry.meta}
                    </p>
                    <p className="mt-0.5 text-micro tabular text-subtle-foreground">{entry.at}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        'text-body-strong tabular',
                        income ? 'text-success' : 'text-foreground',
                      )}
                    >
                      {income ? '+' : '-'}
                      {Math.abs(entry.amount).toFixed(2)}
                    </p>
                    <p className={cn('mt-0.5 text-micro', LEDGER_TONE_CLASS[entry.statusTone])}>
                      {entry.statusText}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <BottomSheet
        open={ruleOpen}
        onClose={() => setRuleOpen(false)}
        title="预估总价说明"
        footer={
          <Button block onClick={() => setRuleOpen(false)}>
            知道了
          </Button>
        }
      >
        <div className="space-y-2.5 text-body leading-relaxed text-muted-foreground">
          <p>预估总价 = 总克重 × 上金所实时金价，金价刷新时同步更新。</p>
          <p>预估收益 = 预估总价 − 购入总价，仅作持仓参考，不代表实际成交。</p>
          <p>该金额为持仓参考市值，需变现（回收或卖出）后到账，不能直接提现。</p>
        </div>
      </BottomSheet>

      <BottomSheet
        open={totalOpen}
        onClose={() => setTotalOpen(false)}
        title="总资产说明"
        footer={
          <Button block onClick={() => setTotalOpen(false)}>
            知道了
          </Button>
        }
      >
        <div className="space-y-2.5 text-body leading-relaxed text-muted-foreground">
          <p>总资产 = 账户余额 + 预估总价（实物黄金持仓参考市值）。</p>
          <p>账户余额可用于购金，也可直接提现。</p>
          <p>预估总价随上金所实时金价波动，需变现（回收或卖出）后才会转为账户余额。</p>
        </div>
      </BottomSheet>
    </DetailPage>
  )
}
