import { useNavigate } from 'react-router-dom'
import { Calculator } from 'lucide-react'
import { AmountSummary } from '@/components/AmountSummary'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { DetailPage } from '@/components/DetailPage'
import { EmptyState } from '@/components/EmptyState'
import { FormulaExplainer } from '@/components/FormulaExplainer'
import { ItemSpecCard } from '@/components/ItemSpecCard'
import { PriceText } from '@/components/PriceText'
import { QUOTE_CATEGORIES, readQuoteSnapshot } from '@/mocks/quote'
import { paths } from '@/routes/paths'

/**
 * 估价结果：金额按「预估货值 / 费用扣减 / 预计应付金额」三层展示。
 * 主按钮进入登录，估价快照留在本地，登录后带入物品信息页。
 */
export function QuoteResultPage() {
  const navigate = useNavigate()
  const snapshot = readQuoteSnapshot()

  if (!snapshot) {
    return (
      <DetailPage title="估价结果">
        <EmptyState
          icon={Calculator}
          title="还没有估价数据"
          description="先填写品类、重量与纯度，即可查看预估结果。"
          action={<Button onClick={() => navigate(paths.quote)}>去估价</Button>}
        />
      </DetailPage>
    )
  }

  const { input, breakdown } = snapshot
  const categoryLabel =
    QUOTE_CATEGORIES.find((item) => item.value === input.category)?.label ?? '未选择品类'

  return (
    <DetailPage
      title="估价结果"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button size="lg" block variant="secondary" onClick={() => navigate(paths.quote)}>
            重新估价
          </Button>
          <Button
            size="lg"
            block
            onClick={() => navigate(paths.login, { state: { from: 'quote' } })}
          >
            立即回收
          </Button>
        </div>
      }
    >
      <Card padding="md">
        <div className="flex items-center justify-between gap-3">
          <span className="text-label text-muted-foreground">预计应付金额</span>
          <Badge tone="warning">预估 · 非终价</Badge>
        </div>
        <div className="mt-2">
          <PriceText value={breakdown.payable} size="display" tone="price" />
        </div>
        <p className="mt-1 text-caption text-subtle-foreground">
          已扣除运保费与保价费，未含服务费
        </p>
      </Card>

      <ItemSpecCard
        category={categoryLabel}
        purity={breakdown.purityLabel}
        weight={breakdown.weight}
        count={breakdown.quantity}
        badge={<Badge tone="info">来自估价</Badge>}
        note="进入物品信息页后仍可修改，修改后将按当前参考金价重新估算。"
      />

      <Card padding="md" className="space-y-3">
        <h2 className="text-card-title text-foreground">预估货值怎么算</h2>
        <FormulaExplainer
          factors={[
            { label: '参考金价', value: breakdown.price.toFixed(0), unit: '元/克' },
            { label: '纯度折算', value: `${(breakdown.purityFactor * 100).toFixed(2)}%` },
            { label: '重量', value: String(breakdown.weight), unit: '克' },
            { label: '数量', value: String(breakdown.quantity), unit: '件' },
          ]}
          result={breakdown.estimatedValue}
          resultLabel="预估货值"
          note="参考价 × 纯度折算 × 重量 × 数量；预估货值不是最终结算金额。"
        />
      </Card>

      <AmountSummary
        rows={[
          {
            label: '预估货值',
            value: breakdown.estimatedValue,
            hint: '按当前参考金价与所选纯度折算',
          },
          {
            label: '运保费预估',
            value: -breakdown.shippingFee,
            hint: '广东省内 18 元、省外 23 元，寄件时按地址确定',
          },
          {
            label: '保价费',
            value: -breakdown.insuranceFee,
            hint: '预估货值 × 0.1%，按预估克重投保',
          },
        ]}
        total={{
          label: '预计应付金额',
          value: breakdown.payable,
          badge: <Badge tone="warning">预估</Badge>,
          note: '已扣除运保费与保价费',
        }}
        footnote="服务费以协议为准，本页暂未计入。最终按检测完成时点金价与实际可熔重量、纯度结算。"
      />

      <Card padding="md" className="space-y-2">
        <h2 className="text-card-title text-foreground">请知悉</h2>
        <ul className="list-disc space-y-1 pl-5 text-body text-muted-foreground">
          <li>预估金额不是最终结算价。</li>
          <li>最终按检测完成时点金价，以及实际可熔重量与纯度结算。</li>
          <li>金价波动超过约定阈值时，终价确认页会显著提示差异。</li>
        </ul>
        <p className="text-caption text-subtle-foreground">
          估价仅在有效期内提交有效，超时需重新估价。
        </p>
      </Card>
    </DetailPage>
  )
}
