import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { BottomSheet } from '@/components/BottomSheet'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { ChoiceGroup } from '@/components/ChoiceGroup'
import { DetailPage } from '@/components/DetailPage'
import { FormField } from '@/components/FormField'
import { QuoteRateCard } from '@/components/QuoteRateCard'
import { SelectField } from '@/components/SelectField'
import { Stepper } from '@/components/Stepper'
import { TextLink } from '@/components/TextLink'
import { useSubmitGuard } from '@/lib/useSubmitGuard'
import { validateWeight } from '@/lib/validation'
import {
  GOLD_RATE,
  PURITY_OPTIONS,
  QUOTE_CATEGORIES,
  calculateQuote,
  formatClock,
  saveQuoteSnapshot,
} from '@/mocks/quote'
import { paths } from '@/routes/paths'

/**
 * 金价与估价：浏览与试算全程不需要登录。
 * 输入品类、重量、纯度、数量后直接出结果；金价异常时停用计算，不拿旧价硬算。
 */
export function QuotePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [category, setCategory] = useState(
    searchParams.get('category') === 'bar' ? 'bar' : 'jewelry',
  )
  const [weight, setWeight] = useState('')
  const [purity, setPurity] = useState('999')
  const [quantity, setQuantity] = useState(1)
  const [updatedAt, setUpdatedAt] = useState(GOLD_RATE.updatedAt)
  const [explainOpen, setExplainOpen] = useState(false)
  const { submitted, attempt } = useSubmitGuard()

  const weightError = validateWeight(weight)

  const quote = calculateQuote({ category, weight, purity, quantity })

  const handleCalculate = () => {
    if (!attempt(quote !== null) || !quote) return
    saveQuoteSnapshot({ category, weight, purity, quantity }, quote)
    navigate(paths.quoteResult)
  }

  return (
    <DetailPage
      title="金价与估价"
      footer={
        <div className="space-y-2">
          <Button size="lg" block onClick={handleCalculate}>
            计算预估
          </Button>
          <p className="text-center text-caption text-subtle-foreground">
            估价不消耗次数，也不需要登录
          </p>
        </div>
      }
    >
      <QuoteRateCard
        label="今日参考回收金价"
        price={GOLD_RATE.price}
        source={GOLD_RATE.source}
        updatedAt={updatedAt}
        status={GOLD_RATE.status}
        footnote="参考价，非最终结算价。"
        onExplain={() => setExplainOpen(true)}
        explainLabel="估价说明"
      />

      <div className="flex items-center justify-between">
        <p className="text-caption text-subtle-foreground">金价异常时将暂停计算，不使用过期金价。</p>
        <TextLink onClick={() => setUpdatedAt(formatClock())}>
          <RefreshCw size={14} />
          刷新
        </TextLink>
      </div>

      <Card padding="md" className="space-y-4">
        <ChoiceGroup
          label="物品品类"
          value={category}
          onChange={setCategory}
          options={QUOTE_CATEGORIES}
          columns={2}
          required
        />

        <FormField
          label="预估重量"
          value={weight}
          onChange={setWeight}
          type="text"
          inputMode="decimal"
          placeholder="请输入预估重量"
          unit="克"
          error={submitted ? weightError : undefined}
          hint="可参考发票、首饰印记或家用秤读数"
          required
        />

        <SelectField
          label="纯度"
          value={purity}
          onChange={setPurity}
          options={PURITY_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
          hint="按饰品印记选择；不确定时可选择常见足金标准"
          required
        />

        <div className="flex min-h-11 items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-body-strong text-foreground">数量</p>
            <p className="mt-0.5 text-caption text-subtle-foreground">按件计算，最多 20 件</p>
          </div>
          <Stepper value={quantity} min={1} max={20} onChange={setQuantity} />
        </div>
      </Card>

      <Card padding="md" className="space-y-2">
        <h2 className="text-card-title text-foreground">金价趋势</h2>
        <p className="text-body text-muted-foreground">
          近 7 日参考金价整体平稳，可随时在上方刷新最新价格。
        </p>
      </Card>

      <BottomSheet
        open={explainOpen}
        onClose={() => setExplainOpen(false)}
        title="估价说明"
        footer={
          <Button block onClick={() => setExplainOpen(false)}>
            知道了
          </Button>
        }
      >
        <div className="space-y-3 text-body text-muted-foreground">
          <p>预估货值 = 参考金价 × 纯度折算 × 重量 × 数量。</p>
          <p>费用扣减包括运保费与保价费；服务费以最终协议为准。</p>
          <p>预估价不是最终结算价，最终按检测结果与检测时点金价结算。</p>
        </div>
      </BottomSheet>
    </DetailPage>
  )
}
