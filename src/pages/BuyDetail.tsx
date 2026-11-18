import { Button, Card, DetailPage, Gallery, IconButton, MediaVisual, PriceText, ProductSkuSheet, SegmentedTabs, TextLink, Toast } from '@/components'
import { useEffect, useState } from 'react'
import { BadgeCheck, ChevronRight, CircleAlert, Headphones, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { images } from '@/assets/images'

import { addToCart, cartCount, subscribeCart } from '@/mocks/cart'
import { writeCheckout } from '@/mocks/checkout'
import { findProduct, soldOf, taglineOf, variantsOf } from '@/mocks/goldShop'
import { paths } from '@/routes/paths'

const SERVICES = [
  { icon: BadgeCheck, title: '一物一证', text: '随货附质检证书' },
  { icon: ShieldCheck, title: '集团检测', text: '安盛华检测背书' },
  { icon: Truck, title: '顺丰保价', text: '全程保价配送' },
]

const PARAMS = [
  ['品牌', '安盛华'],
  ['材质', '足金 999.9'],
  ['工艺', '压铸 / 精雕'],
  ['发票', '支持电子发票'],
  ['证书', '一物一证'],
]

const GALLERY_LABELS = ['商品主图', '工艺细节', '礼赠场景']

type DetailTab = 'product' | 'scene' | 'price'

const DETAIL_TABS: { value: DetailTab; label: string }[] = [
  { value: 'product', label: '产品介绍' },
  { value: 'scene', label: '场景展示' },
  { value: 'price', label: '价格说明' },
]

/** 商品详情：规格、数量、加购、立即购买在同一页闭环，购物车按「商品 + 规格」独立成行。 */
export function BuyDetailPage() {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const product = findProduct(productId)
  const variants = product ? variantsOf(product) : []

  const [variantId, setVariantId] = useState(variants[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetPurpose, setSheetPurpose] = useState<'add' | 'edit'>('add')
  const [toast, setToast] = useState<string | null>(null)
  const [count, setCount] = useState(cartCount)
  const [detailTab, setDetailTab] = useState<DetailTab>('product')

  useEffect(() => subscribeCart(() => setCount(cartCount())), [])

  if (!product) {
    return (
      <DetailPage title="商品详情">
        <Card padding="md" className="space-y-3 text-center">
          <p className="text-body text-muted-foreground">商品已下架或链接有误。</p>
          <Button variant="secondary" block onClick={() => navigate(paths.buy)}>
            返回买金
          </Button>
        </Card>
      </DetailPage>
    )
  }

  const variant = variants.find((item) => item.id === variantId) ?? variants[0]
  const gallery = (product.gallery ?? [product.image]).map((src, index) => ({
    src,
    alt: `${product.name} · ${GALLERY_LABELS[index] ?? `图片 ${index + 1}`}`,
  }))

  const selectVariant = (nextId: string) => {
    setVariantId(nextId)
    const next = variants.find((item) => item.id === nextId)
    if (next) setQuantity((value) => Math.min(value, Math.min(20, next.stock)))
  }

  const openSku = (purpose: 'add' | 'edit') => {
    setSheetPurpose(purpose)
    setSheetOpen(true)
  }

  const confirmSku = () => {
    if (sheetPurpose === 'add') {
      addToCart(product.id, variant.id, quantity)
      setToast(`已加入购物车 · ${variant.label}`)
    }
    setSheetOpen(false)
  }

  return (
    <DetailPage
      title="商品详情"
      padded={false}
      contentClassName="space-y-3 px-0 pt-0"
      footer={
        <div className="flex items-center gap-2">
          <IconButton
            icon={Headphones}
            label="联系客服"
            onClick={() => setToast('客服将在 9:00–21:00 回复')}
          />
          <span className="relative">
            <IconButton icon={ShoppingCart} label="购物车" onClick={() => navigate(paths.cart)} />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-caption leading-none text-primary-foreground">
                {count > 99 ? '99+' : count}
              </span>
            ) : null}
          </span>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => openSku('add')}
          >
            加入购物车
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              // 立即购买：写入 checkout storage 后跳转到全屏确认订单页
              writeCheckout([{ productId: product.id, variantId: variant.id, quantity }])
              navigate(paths.checkout)
            }}
          >
            立即购买
          </Button>
        </div>
      }
    >
      <div className="bg-card pb-3">
        <Gallery images={gallery} label={`${product.name}图片，左右滑动查看`} />
        <p className="px-4 pt-3 text-center text-caption text-subtle-foreground">
          图片为效果与场景示意，请以实物为准
        </p>
      </div>

      <div className="space-y-3 px-4">
        <Card padding="md" className="space-y-2">
          <h1 className="text-card-title text-foreground">{product.name}</h1>
          <p className="text-caption text-gold-700">{taglineOf(product)}</p>
          <div className="flex items-end justify-between gap-3 pt-1">
            <PriceText value={variant.price} size="section" tone="price" />
            <span className="text-caption text-subtle-foreground">已售 {soldOf(product)}</span>
          </div>
        </Card>

        <Card padding="none" className="overflow-hidden">
          <button
            type="button"
            onClick={() => openSku('edit')}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <span className="text-body text-foreground">
              已选
              <span className="ml-2 text-body-strong">
                规格 {variant.label} · {quantity} 件
              </span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-subtle-foreground" />
          </button>
          <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-4 py-3">
            <span className="text-body text-foreground">配送</span>
            <span className="text-body text-muted-foreground">
              顺丰保价 · 预计 2–3 天送达
            </span>
          </div>
          <div className="border-t border-border-subtle px-4 py-3">
            <p className="text-caption text-primary">贵金属商品 · 不支持 7 天无理由退换</p>
          </div>
        </Card>

        <Card padding="md" className="grid grid-cols-3 gap-2">
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col items-center gap-1 text-center">
              <Icon size={20} className="text-gold-700" />
              <p className="text-caption-strong text-foreground">{title}</p>
              <p className="text-caption text-subtle-foreground">{text}</p>
            </div>
          ))}
        </Card>

        <Card padding="md" className="space-y-2 bg-primary-soft ring-primary-border">
          <div className="flex items-center gap-2">
            <CircleAlert size={20} className="shrink-0 text-primary" />
            <h2 className="text-card-title text-primary">不支持 7 天无理由退换</h2>
          </div>
          <p className="text-body text-foreground">
            黄金属于价格随行情波动的贵金属商品，且配有对应证书与防伪封装，非质量问题不支持七天无理由退货或换货。
          </p>
          <ul className="list-disc space-y-1 pl-5 text-caption text-muted-foreground">
            <li>签收时请核验外包装、防伪封装、商品与证书，并保留开箱凭证。</li>
            <li>如有质量问题、错发或运输损坏，请联系在线客服，核实后按售后规则处理。</li>
          </ul>
        </Card>

        <Card padding="md">
          <SegmentedTabs
            items={DETAIL_TABS}
            value={detailTab}
            onChange={(value) => setDetailTab(value as DetailTab)}
            variant="underline"
            className="-mx-4 -mt-4"
          />

          <div className="mt-4" role="tabpanel" aria-label="商品详情内容">
            {detailTab === 'product' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-card-title text-foreground">足金臻品 · 一物一证</h2>
                  <p className="text-body text-muted-foreground">
                    以精细工艺呈现纹理与金属光泽，适用于纪念收藏、节庆礼赠和家庭资产配置。每件商品随附质检证书。
                  </p>
                </div>
                <MediaVisual
                  src={product.gallery?.[1] ?? product.image}
                  alt={`${product.name}工艺细节`}
                  ratio="wide"
                  className="rounded-md bg-gold-50"
                />
                <dl className="space-y-2">
                  {PARAMS.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <dt className="text-body text-subtle-foreground">{label}</dt>
                      <dd className="text-body text-foreground">{value}</dd>
                    </div>
                  ))}
                  <div className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 text-body text-subtle-foreground">可选规格</dt>
                    <dd className="text-right text-body text-foreground">
                      {variants.map((item) => item.label).join(' / ')}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : null}

            {detailTab === 'scene' ? (
              <div className="space-y-3">
                <MediaVisual
                  src={images.heroEndorse}
                  alt="黄金投资收藏与节庆礼赠场景"
                  ratio="wide"
                  className="rounded-md"
                />
                <div className="space-y-2">
                  <h2 className="text-card-title text-foreground">一份金礼，多重心意</h2>
                  <p className="text-body text-muted-foreground">
                    既可用于生肖纪念与节庆礼赠，也适合纳入家庭长期资产配置。实物包装随商品配送，具体样式以发货为准。
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['生肖纪念', '节庆礼赠', '投资收藏'].map((item) => (
                    <div
                      key={item}
                      className="rounded-md bg-gold-50 px-2 py-3 text-center text-caption-strong text-gold-800"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {detailTab === 'price' ? (
              <div className="space-y-4">
                <div className="rounded-md bg-gold-50 p-3 ring-1 ring-gold-200">
                  <p className="text-caption text-gold-800">
                    当前所选 {variant.label} × {quantity} 件
                  </p>
                  <div className="mt-1">
                    <PriceText value={variant.price * quantity} size="section" tone="price" />
                  </div>
                  <p className="mt-1 text-caption text-subtle-foreground">合计金额随规格与数量实时更新</p>
                </div>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-body-strong text-foreground">如何计价</dt>
                    <dd className="mt-1 text-body text-muted-foreground">
                      按所选商品、克重与数量计算，不同规格对应不同售价。
                    </dd>
                  </div>
                  <div>
                    <dt className="text-body-strong text-foreground">价格确认</dt>
                    <dd className="mt-1 text-body text-muted-foreground">
                      黄金行情可能波动，提交前请核对价格；订单金额以提交时页面确认为准。
                    </dd>
                  </div>
                  <div>
                    <dt className="text-body-strong text-foreground">销售价与回收价</dt>
                    <dd className="mt-1 text-body text-muted-foreground">
                      销售价包含工艺与配套服务等成本，不等同于原料金价或回收价；回售需另行检测与报价。
                    </dd>
                  </div>
                </dl>
                <TextLink onClick={() => navigate(paths.quote)}>查看今天的回收价</TextLink>
              </div>
            ) : null}
          </div>
        </Card>

        <p className="pb-2 text-center text-caption text-subtle-foreground">已经到底了</p>
      </div>

      <ProductSkuSheet
        open={sheetOpen}
        product={product}
        variantId={variant.id}
        quantity={quantity}
        confirmLabel={sheetPurpose === 'add' ? '加入购物车' : '确认选择'}
        onVariantChange={selectVariant}
        onQuantityChange={setQuantity}
        onClose={() => setSheetOpen(false)}
        onConfirm={confirmSku}
      />

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}
