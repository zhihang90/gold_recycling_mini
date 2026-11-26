import {
  Button,
  Card,
  DetailPage,
  Gallery,
  IconButton,
  MediaVisual,
  PriceText,
  SegmentedTabs,
  TextLink,
  Toast,
} from '@/components'
import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  CircleAlert,
  Headphones,
  QrCode,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { images } from '@/assets/images'

import { useLiveGoldPrice } from '@/hooks/useLiveGoldPrice'
import { addToCart, cartCount, subscribeCart } from '@/mocks/cart'
import { writeCheckout } from '@/mocks/checkout'
import { findProduct, PRODUCT_PURITY, soldOf, variantsOf } from '@/mocks/goldShop'
import { readMember } from '@/mocks/member'
import { feePerGram } from '@/mocks/pricing'
import { loginRedirectState, paths } from '@/routes/paths'

const PARAMS = [
  ['品牌', '安盛华'],
  ['材质', '足金 999.9'],
  ['工艺', '压铸 / 精雕'],
  ['发票', '支持电子发票'],
  ['证书', '一物一证'],
]

const GALLERY_LABELS = ['商品主图', '工艺细节', '礼赠场景']

/** 商品服务标签：与竞品一致，一物一证、可追溯、可复检、顺丰保价 */
const SERVICE_TAGS = [
  { icon: BadgeCheck, label: '质检证书' },
  { icon: QrCode, label: '可溯源' },
  { icon: ShieldCheck, label: '支持复检' },
  { icon: Truck, label: '顺丰邮寄' },
]

type DetailTab = 'product' | 'scene' | 'price'

const DETAIL_TABS: { value: DetailTab; label: string }[] = [
  { value: 'product', label: '产品介绍' },
  { value: 'scene', label: '场景展示' },
  { value: 'price', label: '价格说明' },
]

/** 商品详情：每个商品只有一个克重，加购与立即购买直接使用该克重。 */
export function BuyDetailPage() {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const product = findProduct(productId)

  const [toast, setToast] = useState<string | null>(null)
  const [count, setCount] = useState(cartCount)
  const [detailTab, setDetailTab] = useState<DetailTab>('product')

  useEffect(() => subscribeCart(() => setCount(cartCount())), [])
  /** 与列表页、行情页共用同一金价模型，报价刷新时同步重算售价 */
  useLiveGoldPrice()

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

  const variant = variantsOf(product)[0]
  const gallery = (product.gallery ?? [product.image]).map((src, index) => ({
    src,
    alt: `${product.name} · ${GALLERY_LABELS[index] ?? `图片 ${index + 1}`}`,
  }))

  /** 交易类操作需登录：未登录直接去登录页，登录后回跳当前商品详情 */
  const requireLogin = (action: () => void) => {
    if (!readMember()) {
      navigate(paths.login, { state: loginRedirectState() })
      return
    }
    action()
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
            onClick={() =>
              requireLogin(() => {
                addToCart(product.id, variant.id, 1)
                setToast(`已加入购物车 · ${variant.label}`)
              })
            }
          >
            加入购物车
          </Button>
          <Button
            className="flex-1"
            onClick={() =>
              requireLogin(() => {
                // 立即购买：写入 checkout storage 后跳转到全屏确认订单页
                writeCheckout([{ productId: product.id, variantId: variant.id, quantity: 1 }])
                navigate(paths.checkout)
              })
            }
          >
            立即购买
          </Button>
        </div>
      }
    >
      <div className="bg-card pb-3">
        <Gallery images={gallery} label={`${product.name}图片，左右滑动查看`} />
        <div className="mt-3 flex items-center justify-between gap-1 px-4">
          {SERVICE_TAGS.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1 text-caption text-foreground/85">
              <Icon size={14} className="shrink-0 text-gold-700" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 px-4">
        <Card padding="none" className="overflow-hidden">
          <div className="space-y-1 px-4 py-3">
            <h1 className="text-card-title text-foreground">{product.name}</h1>
            <div className="flex items-end justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <PriceText value={variant.price} size="section" tone="price" />
                <span className="text-caption text-subtle-foreground">
                  工费 {feePerGram(product.grams)} 元/克
                </span>
              </div>
              <span className="shrink-0 text-caption text-subtle-foreground">
                已售 {soldOf(product)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-4 py-3">
            <span className="text-body text-foreground">
              规格
              <span className="ml-2 text-body-strong">
                {variant.label} {PRODUCT_PURITY}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-4 py-3">
            <span className="text-body text-foreground">配送</span>
            <span className="text-body text-muted-foreground">顺丰保价 · 预计 2–3 天送达</span>
          </div>
          <div className="border-t border-border-subtle px-4 py-3">
            <p className="text-caption text-primary">贵金属商品 · 不支持 7 天无理由退换</p>
          </div>
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
                    <dt className="shrink-0 text-body text-subtle-foreground">克重</dt>
                    <dd className="text-right text-body text-foreground">{variant.label}</dd>
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
                  <p className="text-caption text-gold-800">当前商品 {variant.label}</p>
                  <div className="mt-1">
                    <PriceText value={variant.price} size="section" tone="price" />
                  </div>
                  <p className="mt-1 text-caption text-subtle-foreground">
                    售价 =（实时金价 + 工费）× 克重
                  </p>
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

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}
