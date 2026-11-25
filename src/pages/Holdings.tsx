import { Button, Card, DetailPage, EmptyState, SegmentedTabs, Toast } from '@/components'
import { HOLDINGS_BALANCE, HOLDINGS_LOTS, holdingsOverview } from '@/mocks/holdings'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type AssetTab = 'holdings' | 'flow'

/**
 * 我的资产：金色概览 + 账户余额 + 持仓台账 / 资金流水。
 * 从首页「持仓速览」进入，需登录后访问。
 */
export function HoldingsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<AssetTab>('holdings')
  const [toast, setToast] = useState<string | null>(null)
  const overview = holdingsOverview()

  return (
    <DetailPage title="我的资产">
      {/* 金色概览：全宽铺满，四宫格读数 */}
      <div className="-mx-4 -mt-4 bg-gradient-to-b from-gold-600 to-gold-700 px-4 pt-4 pb-5 text-gold-50">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="text-caption text-gold-50/75">当前市值</p>
            <p className="mt-0.5 text-[26px] leading-tight font-semibold tabular">
              <span className="text-body">¥</span>
              {overview.marketValue}
            </p>
          </div>
          <div className="text-right">
            <p className="text-caption text-gold-50/75">持仓盈亏</p>
            <p className="mt-0.5 text-[26px] leading-tight font-semibold tabular text-orange-200">
              {overview.profit >= 0 ? '+' : '-'}
              {Math.abs(overview.profit)}
            </p>
          </div>
          <div>
            <p className="text-caption text-gold-50/75">持仓重量</p>
            <p className="mt-0.5 text-card-title tabular">{overview.grams}g</p>
          </div>
          <div className="text-right">
            <p className="text-caption text-gold-50/75">收益率</p>
            <p className="mt-0.5 text-card-title tabular text-orange-200">
              {overview.profitRate.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* 账户余额：充值 / 提现 / 买入 */}
      <Card padding="md" className="space-y-3">
        <div>
          <p className="text-caption text-subtle-foreground">账户余额</p>
          <p className="mt-1 text-[26px] leading-tight font-semibold tabular text-foreground">
            <span className="text-body">¥</span>
            {HOLDINGS_BALANCE}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" onClick={() => setToast('充值功能待开放')}>
            充值
          </Button>
          <Button variant="secondary" onClick={() => setToast('提现功能待开放')}>
            提现
          </Button>
          <Button onClick={() => navigate('/buy')}>买入</Button>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <SegmentedTabs
          items={[
            { value: 'holdings', label: '持仓台账' },
            { value: 'flow', label: '资金流水' },
          ]}
          value={tab}
          onChange={(value) => setTab(value as AssetTab)}
          variant="underline"
          fill
          className="bg-card px-3"
        />

        {tab === 'holdings' ? (
          <div className="space-y-3 p-3">
            {HOLDINGS_LOTS.map((lot) => (
              <div
                key={lot.id}
                className="flex items-start gap-3 rounded-md bg-surface-2 px-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body-strong text-foreground">{lot.name}</p>
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-caption">
                    <span className="text-subtle-foreground">
                      买入价{' '}
                      <span className="tabular text-foreground">¥{lot.buyPrice.toFixed(1)}/g</span>
                    </span>
                    <span className="text-right text-subtle-foreground">
                      重量 <span className="tabular text-foreground">{lot.grams}g</span>
                    </span>
                    <span className="text-subtle-foreground">
                      成本 <span className="tabular text-foreground">¥{lot.cost}</span>
                    </span>
                    <span className="text-right text-subtle-foreground">
                      买入日期 <span className="tabular text-foreground">{lot.boughtAt}</span>
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-caption text-gold-700">{lot.spec}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3">
            <EmptyState title="暂无资金流水" description="充值、提现与交易记录将在这里展示" />
          </div>
        )}
      </Card>

      <p className="px-1 text-center text-caption text-subtle-foreground">
        持仓市值随行情波动，仅供参考
      </p>

      <Toast open={!!toast} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}
