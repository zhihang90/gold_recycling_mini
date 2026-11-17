import { useState } from 'react'
import { Badge } from '@/components/Badge'
import { BottomSheet } from '@/components/BottomSheet'
import { Gallery } from '@/components/Gallery'
import { InlineNotice } from '@/components/InlineNotice'
import { FormulaExplainer } from '@/components/FormulaExplainer'
import { ItemSpecCard } from '@/components/ItemSpecCard'
import { QuoteRateCard } from '@/components/QuoteRateCard'
import { ASSAY_IMAGES } from './data'
import { GuideFooter, GuidePage, Section } from './shared'

/** 黄金回收 · 报价与估价域 */
export function QuoteGuidePage() {
  const [quoteExplain, setQuoteExplain] = useState(false)
  const [itemPreviewOpen, setItemPreviewOpen] = useState(false)

  return (
    <GuidePage title="报价与估价">
      <Section title="参考金价 QuoteRateCard">
        <QuoteRateCard
          label="今日参考金价"
          price={628.5}
          source="上海黄金交易所 Au99.99"
          updatedAt="11-16 10:30 更新"
          validUntil="报价有效期至 11-16 23:59"
          footnote="仅作参考，最终按检测完成时点金价结算。"
          onExplain={() => setQuoteExplain((value) => !value)}
          explainLabel="计价说明"
        />
        {quoteExplain ? (
          <InlineNotice tone="info">
            示例说明：金价 × 含金量 × 可熔重量 − 服务费，检测完成后按当时金价结算。
          </InlineNotice>
        ) : null}
        <QuoteRateCard
          label="今日参考金价"
          price={628.5}
          source="上海黄金交易所 Au99.99"
          updatedAt="11-16 10:30 更新"
          status="delayed"
        />
        <QuoteRateCard
          label="今日参考金价"
          price={628.5}
          source="上海黄金交易所 Au99.99"
          updatedAt="11-16 09:00 更新"
          status="halted"
        />
        <InlineNotice tone="warning">
          参考价暂不可用，检测与结算不受影响，最终以检测完成时点为准。
        </InlineNotice>
        <div className="text-caption text-subtle-foreground">
          金价不做涨跌配色：延迟只用墨色降级，停报显示「—」，避免与品牌行动红混淆。
        </div>
      </Section>

      <Section title="计价公式 FormulaExplainer">
        <FormulaExplainer
          factors={[
            { label: '可熔重量', value: '12.39', unit: '克' },
            { label: '含金量', value: '94.20', unit: '%' },
            { label: 'Au99.99 金价', value: '628.50', unit: '元/克' },
          ]}
          deductions={[{ label: '服务费', value: '38.00' }]}
          result={7297.86}
          resultLabel="预估到手"
          note="预估金额仅作参考，最终以检测完成时点金价与实测结果为准。"
        />
        <FormulaExplainer
          compact
          factors={[
            { label: '预估克重', value: '12.68', unit: '克' },
            { label: '参考金价', value: '628.50', unit: '元/克' },
          ]}
          result={7969.38}
          note="示例：未计检测差异，非最终金额；无其他扣费时也要在说明里写清。"
        />
        <div className="text-caption text-subtle-foreground">
          纯展示组件，不做计算；扣减项传几项就渲染几项，不允许隐藏。
        </div>
      </Section>

      <Section title="物品规格 ItemSpecCard">
        <ItemSpecCard
          category="足金首饰 · 示例手镯"
          purity="足金 999"
          weight={12.68}
          count={2}
          hallmark="钢印 AU999"
          note="无照片时显示占位块，不留塌陷。"
        />
        <ItemSpecCard
          variant="actual"
          category="足金首饰 · 示例手镯"
          purity="足金 999"
          weight={12.39}
          count={2}
          weightLabel="实测可熔重"
          hallmark="钢印 AU999"
          photos={ASSAY_IMAGES}
          badge={<Badge tone="warning">有差异</Badge>}
          note="非金配件已扣除，差异见检测域对照。"
          onViewPhotos={() => setItemPreviewOpen(true)}
          viewPhotosLabel="查看全部 3 张"
        />
      </Section>

      <GuideFooter>报价与估价域不承载检测结论，结论见「检测与合规」</GuideFooter>

      <BottomSheet open={itemPreviewOpen} onClose={() => setItemPreviewOpen(false)} title="物品照片">
        <Gallery
          images={ASSAY_IMAGES.map((src) => ({ src, alt: '示例图片' }))}
          className="overflow-hidden rounded-md"
        />
        <div className="mt-3 text-caption text-subtle-foreground">
          示例：影像仅用于核对结论与留痕，不提供原图下载。
        </div>
      </BottomSheet>
    </GuidePage>
  )
}
