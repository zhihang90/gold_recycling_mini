import { Badge, Button, Card, ChoiceGroup, DetailPage, FormField, InlineNotice, PriceText, SelectField, Stepper, TextLink, UploadGroup } from '@/components'
import { useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { images } from '@/assets/images'

import { useSubmitGuard } from '@/lib/useSubmitGuard'
import { useDemoScene } from '@/lib/useDemoScene'
import { validateWeight } from '@/lib/validation'
import {
  CERTIFICATE_OPTIONS,
  ITEM_CATEGORIES,
  demoOrderDraft,
  findItemCategory,
  readOrderDraft,
  writeOrderDraft,
  type OrderDraft,
} from '@/mocks/orderFlow'
import { PURITY_OPTIONS, calculateQuote, readQuoteSnapshot } from '@/mocks/quote'
import { useOrderStep } from '@/flows/orderSteps'

/**
 * 物品信息：全流程唯一的物品录入入口。
 * 不支持的品类就地拦截、不可提交；估价快照可带入、可修改，修改后重新估算。
 */
export function OrderItemPage() {
  const { nextLabel, goNext } = useOrderStep('item')
  const demoScene = useDemoScene()
  const [initial] = useState<OrderDraft>(() => {
    if (demoScene === 'item') return demoOrderDraft()

    const saved = readOrderDraft()
    const snapshot = readQuoteSnapshot()
    if (!snapshot || snapshot.createdAt === saved.quoteSnapshotAt) return saved

    return {
      ...saved,
      category: snapshot.input.category,
      weight: snapshot.input.weight,
      purity: snapshot.input.purity,
      quantity: snapshot.input.quantity,
      fromQuote: true,
      quoteSnapshotAt: snapshot.createdAt,
    }
  })

  const [category, setCategory] = useState(initial.category)
  const [weight, setWeight] = useState(initial.weight)
  const [purity, setPurity] = useState(initial.purity)
  const [quantity, setQuantity] = useState(initial.quantity)
  const [defects, setDefects] = useState(initial.defects)
  const [brand, setBrand] = useState(initial.brand)
  const [spec, setSpec] = useState(initial.spec)
  const [certificate, setCertificate] = useState(initial.certificate)
  const [overall, setOverall] = useState(initial.photos.overall)
  const [mark, setMark] = useState(initial.photos.mark)
  const [detail, setDetail] = useState(initial.photos.detail)
  const { submitted, attempt } = useSubmitGuard()

  const selectedCategory = findItemCategory(category)
  const blocked = selectedCategory !== undefined && !selectedCategory.supported
  const supported = selectedCategory?.supported === true
  const isBar = category === 'bar'

  const weightError = validateWeight(weight)
  const photosValid = overall.length > 0
  const quote = supported ? calculateQuote({ category, weight, purity, quantity }) : null

  const categoryError = submitted && !selectedCategory ? '请选择物品品类' : undefined
  const photosError =
    submitted && !blocked && !photosValid ? '请至少上传 1 张整体图' : undefined

  const useSamples = () => {
    setOverall([images.photoOverallSample])
    setMark([images.photoMarkSample])
    setDetail([images.photoDetailSample])
  }

  const handleNext = () => {
    if (!attempt(supported && !weightError && photosValid)) return

    writeOrderDraft({
      category,
      weight,
      purity,
      quantity,
      defects,
      brand,
      spec,
      certificate,
      photos: { overall, mark, detail },
      fromQuote: initial.fromQuote,
      quoteSnapshotAt: initial.quoteSnapshotAt,
    })
    goNext?.()
  }

  return (
    <DetailPage
      title="物品信息"
      footer={
        <Button size="lg" block disabled={blocked} onClick={handleNext}>
          {nextLabel}
        </Button>
      }
    >
      {initial.fromQuote ? (
        <InlineNotice tone="info">
          已带入估价时的品类、重量、纯度与数量，可直接修改；修改后将按当前参考金价重新估算。
        </InlineNotice>
      ) : null}

      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-card-title text-foreground">物品品类</h2>
          {initial.fromQuote ? <Badge tone="info">来自估价</Badge> : null}
        </div>
        <ChoiceGroup
          label="选择品类"
          value={category}
          onChange={setCategory}
          options={ITEM_CATEGORIES.map((item) => ({
            value: item.value,
            label: item.label,
            description: item.description,
          }))}
          columns={2}
          error={categoryError}
          required
        />
        {blocked && selectedCategory?.blockReason ? (
          <InlineNotice tone="danger" title="该品类暂不回收">
            {selectedCategory.blockReason}
          </InlineNotice>
        ) : null}
        {!selectedCategory ? (
          <InlineNotice tone="info">
            请先选择物品品类，页面会根据品类显示对应的实物信息字段。
          </InlineNotice>
        ) : null}
      </Card>

      {supported ? (
        <>
          <Card padding="md" className="space-y-4">
            <h2 className="text-card-title text-foreground">实物信息</h2>

            <FormField
              label="预估重量"
              value={weight}
              onChange={setWeight}
              type="text"
              inputMode="decimal"
              placeholder="请输入预估重量"
              unit="克"
              error={submitted ? weightError : undefined}
              hint="以实物或发票重量为准，检测后按可熔重量结算"
              required
            />

            <SelectField
              label="纯度"
              value={purity}
              onChange={setPurity}
              options={PURITY_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
              hint="按饰品印记或金条标识选择"
              required
            />

            <div className="flex min-h-11 items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-body-strong text-foreground">数量</p>
                <p className="mt-0.5 text-caption text-subtle-foreground">按件计算，最多 20 件</p>
              </div>
              <Stepper value={quantity} min={1} max={20} onChange={setQuantity} />
            </div>

            {isBar ? (
              <>
                <FormField
                  label="品牌 / 机构"
                  value={brand}
                  onChange={setBrand}
                  placeholder="如：周大福、工商银行"
                  hint="金条或金币的发行品牌"
                />
                <FormField
                  label="规格"
                  value={spec}
                  onChange={setSpec}
                  placeholder="如：100 克 / 1 盎司"
                />
                <SelectField
                  label="证书情况"
                  value={certificate}
                  onChange={setCertificate}
                  options={CERTIFICATE_OPTIONS.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  placeholder="请选择证书情况"
                />
                <p className="text-caption text-subtle-foreground">
                  纪念金币、特殊工艺金条按原料金口径回收，不承诺溢价。
                </p>
              </>
            ) : (
              <FormField
                label="瑕疵与配件说明"
                value={defects}
                onChange={setDefects}
                multiline
                placeholder="如：有断链、缺少搭扣、含非金配件等（选填）"
                hint="含非金配件请先拆除，否则可能被拒收"
              />
            )}
          </Card>

          <UploadGroup
            title="实物照片"
            description="整体图必传；印记与细节图建议上传。支持 JPG / PNG，单张不超过 10MB。照片仅用于初步判断，不替代检测。"
            required
            error={photosError}
            examples={[
              { src: images.photoOverallSample, alt: '整体图示例' },
              { src: images.photoMarkSample, alt: '印记示例' },
              { src: images.photoDetailSample, alt: '细节图示例' },
            ]}
            slots={[
              { key: 'overall', label: '整体图', value: overall, onChange: setOverall, min: 1, max: 3 },
              { key: 'mark', label: '印记 / 钢印', value: mark, onChange: setMark, max: 2 },
              { key: 'detail', label: '细节图', value: detail, onChange: setDetail, max: 2 },
            ]}
          />

          <div className="flex justify-end">
            <TextLink onClick={useSamples}>
              <ImagePlus size={14} />
              使用示例照片
            </TextLink>
          </div>

          <Card padding="md">
            <p className="text-caption text-muted-foreground">当前预估区间</p>
            {quote ? (
              <div className="mt-1 flex items-baseline gap-1">
                <PriceText value={Math.round(quote.payable * 0.97)} size="section" tone="gold" />
                <span className="text-body text-subtle-foreground">–</span>
                <PriceText value={Math.round(quote.payable * 1.03)} size="section" tone="gold" />
              </div>
            ) : (
              <p className="mt-1 text-body text-subtle-foreground">
                填写重量与纯度后显示预估区间
              </p>
            )}
            <p className="mt-1 text-caption text-subtle-foreground">
              按当前参考金价估算，非最终结算价。
            </p>
          </Card>
        </>
      ) : null}

      <p className="text-caption text-subtle-foreground">
        企业 / 对公回收请转人工客服，不进入个人交易流程。
      </p>
    </DetailPage>
  )
}
