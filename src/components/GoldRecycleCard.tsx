import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLiveGoldPrice } from '@/hooks/useLiveGoldPrice'
import { readMember } from '@/mocks/member'
import { recyclePriceOf } from '@/mocks/pricing'
import { loginRedirectState, paths } from '@/routes/paths'

import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { Card } from './Card'

/** 回收计价说明：点击标题旁的问号以气泡形式展开 */
const PRICE_TIPS = [
  '金条回收价 = 上金所实时金价 − 服务费（费率 2%）',
  '金饰回收价 = 上金所实时金价 − 服务费（费率 4%）',
  '预估回收金额按您下单时的金价计算，最终按检测完成时点的实时金价结算。',
]

/**
 * 首页黄金回收卡：实时回收价 + 一键回收。
 * 回收价 = 上金所实时金价 ×（1 - 服务费（费率 2%）），随全站报价节拍刷新。
 */
export function GoldRecycleCard() {
  const navigate = useNavigate()
  const price = useLiveGoldPrice()
  const recyclePrice = recyclePriceOf(price)
  const [tipsOpen, setTipsOpen] = useState(false)

  /** 一键回收属于交易入口：未登录直接去登录页，登录后回跳当前页 */
  const startRecycle = () => {
    if (!readMember()) {
      navigate(paths.login, { state: loginRedirectState() })
      return
    }
    navigate(paths.quote)
  }

  return (
    <Card padding="md" className="space-y-3 text-center">
      <div>
        <div className="flex items-center justify-center gap-1">
          <h2 className="text-card-title text-foreground">黄金回收</h2>
          <button
            type="button"
            onClick={() => setTipsOpen(true)}
            aria-label="回收价计算说明"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-caption leading-none text-subtle-foreground ring-1 ring-border-subtle transition active:bg-surface-2"
          >
            ?
          </button>
        </div>
        <p className="mt-0.5 text-caption text-subtle-foreground">回收金条 / 首饰等</p>
      </div>

      <div>
        <p className="flex items-baseline justify-center gap-1">
          <span className="text-display tabular text-gold-800">{recyclePrice.toFixed(2)}</span>
          <span className="text-caption text-subtle-foreground">元/克</span>
        </p>
      </div>

      <Button block onClick={startRecycle}>
        一键回收
      </Button>

      <BottomSheet
        open={tipsOpen}
        onClose={() => setTipsOpen(false)}
        title="回收价说明"
        footer={
          <Button className="w-full" onClick={() => setTipsOpen(false)}>
            我已知晓
          </Button>
        }
      >
        <ol className="space-y-2 text-body leading-relaxed text-foreground">
          {PRICE_TIPS.map((tip, index) => (
            <li key={tip}>
              {index + 1}、{tip}
            </li>
          ))}
        </ol>
      </BottomSheet>
    </Card>
  )
}
