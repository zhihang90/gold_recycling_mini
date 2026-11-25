import {
  Button,
  Card,
  Chip,
  ChipRow,
  IconButton,
  MediaVisual,
  PriceText,
  ProductSkuSheet,
  SupportFab,
  TabPage,
  Toast,
} from '@/components'
import { useEffect, useState } from 'react'
import { ShoppingCart, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { addToCart } from '@/mocks/cart'
import { quoteByCode, quoteChange, simulateMarketTick } from '@/mocks/market'
import { GOLD_PRODUCTS, SALE_RATE, SHOP_CATEGORIES, variantsOf } from '@/mocks/goldShop'
import type { GoldCategory, GoldProduct } from '@/mocks/goldShop'
import { buyDetailPath, paths } from '@/routes/paths'

/** 买金：投资金销售入口，与回收共用同一账号与订单体系。 */
export function BuyPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<'all' | GoldCategory>('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<GoldProduct>()
  const [variantId, setVariantId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [toast, setToast] = useState<string | null>(null)
  /** 上金所 Au99.99 基准价：5 秒刷新一次，与行情页同源 */
  const [liveAu, setLiveAu] = useState(() => quoteChange(quoteByCode('au9999')!))
  const [updatedAt, setUpdatedAt] = useState(() => formatClock(new Date()))

  useEffect(() => {
    const timer = window.setInterval(() => {
      simulateMarketTick()
      setLiveAu(quoteChange(quoteByCode('au9999')!))
      setUpdatedAt(formatClock(new Date()))
    }, 5000)
    return () => window.clearInterval(timer)
  }, [])

  const products = GOLD_PRODUCTS.filter(
    (product) => category === 'all' || product.category === category,
  )

  return (
    <TabPage>
      {/* 上金所实时金价横幅：标题与涨跌胶囊一行，价格与更新时间一行 */}
      <div className="-mx-4 -mt-4 bg-gradient-to-br from-gold-700 via-gold-600 to-gold-800 px-4 py-3.5 text-gold-50">
        <div className="flex items-center justify-between gap-3">
          <p className="text-caption text-gold-50/75">上金所实时金价</p>
          <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-micro tabular text-gold-100">
            {liveAu.change >= 0 ? '+' : '-'}
            {Math.abs(liveAu.change).toFixed(2)}（{liveAu.changePct >= 0 ? '+' : '-'}
            {Math.abs(liveAu.changePct).toFixed(2)}%）
          </span>
        </div>
        <div className="mt-1.5 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[34px] leading-none font-semibold tabular tracking-tight">
              {liveAu.price.toFixed(2)}
            </span>
            <span className="text-caption text-gold-50/70">元/克</span>
          </div>
          <p className="shrink-0 whitespace-nowrap text-micro tabular text-gold-50/55">
            更新于 {updatedAt}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg bg-gold-50 p-4 ring-1 ring-gold-200">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-caption text-gold-700">
            <TrendingUp size={14} strokeWidth={2} />
            实时金价
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <PriceText value={SALE_RATE.price} size="title" tone="gold" />
            <span className="text-caption text-gold-700">元/克</span>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate(paths.home)}>
          我要卖金
        </Button>
      </div>

      <div className="space-y-2.5">
        <ChipRow>
          {SHOP_CATEGORIES.map((item) => (
            <Chip
              key={item.value}
              active={category === item.value}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </Chip>
          ))}
        </ChipRow>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => {
          const variants = variantsOf(product)
          return (
            <Card key={product.id} padding="none" className="flex h-full flex-col overflow-hidden">
              <Link to={buyDetailPath(product.id)} className="block">
                <div className="relative">
                  <MediaVisual src={product.image} alt={product.name} className="bg-gold-50" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-2 top-2 flex items-center gap-1"
                  >
                    <span className="h-1 w-1 rotate-45 bg-gold-500/70" />
                    <span className="font-serif text-caption-strong text-gold-800/55">
                      安盛华黄金
                    </span>
                  </span>
                  {product.isNew ? (
                    <span className="absolute right-2 top-2 inline-flex h-5 items-center gap-1 rounded-pill bg-ink-900/90 px-2 text-caption-strong text-gold-100 shadow-xs ring-1 ring-gold-400/25">
                      <span aria-hidden="true" className="h-1 w-1 rounded-pill bg-gold-400" />
                      焕新升级
                    </span>
                  ) : null}
                </div>

                <div className="px-3 pt-2">
                  <h2 className="line-clamp-2 text-label font-semibold text-ink-900">
                    {product.name}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-caption text-subtle-foreground">
                    {cardSpec(product.caption)}
                  </p>
                </div>
              </Link>

              <div className="mt-auto flex items-end justify-between gap-1 px-3 pb-3 pt-1.5">
                <PriceText value={variants[0].price} size="body" tone="gold" />
                <IconButton
                  icon={ShoppingCart}
                  label={`选择${product.name}规格`}
                  variant="outline"
                  className="h-9 w-9 text-gold-700 ring-gold-300"
                  onClick={() => {
                    setSelectedProduct(product)
                    setVariantId(variants[0].id)
                    setQuantity(1)
                    setSheetOpen(true)
                  }}
                />
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-2 pb-2 pt-1 text-caption text-subtle-foreground">
        <span className="h-px w-5 bg-line" aria-hidden="true" />
        已经到底了
        <span className="h-px w-5 bg-line" aria-hidden="true" />
      </div>

      <ProductSkuSheet
        open={sheetOpen}
        product={selectedProduct}
        variantId={variantId}
        quantity={quantity}
        confirmLabel="加入购物车"
        onVariantChange={setVariantId}
        onQuantityChange={setQuantity}
        onClose={() => setSheetOpen(false)}
        onConfirm={() => {
          if (!selectedProduct) return
          addToCart(selectedProduct.id, variantId, quantity)
          setSheetOpen(false)
          setToast(`已加入购物车 · ${selectedProduct.name}`)
        }}
      />

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />

      <SupportFab />
    </TabPage>
  )
}

/** 更新时间：北京时间，精确到秒 */
function formatClock(date: Date) {
  return date.toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai', hour12: false })
}

/** 商品卡的规格行：从 caption 提取克重选项，统一成竞品「5g | 10g | …」的写法。 */ function cardSpec(
  caption: string,
) {
  const options = caption
    .replace(/^.*规格：/, '')
    .replace(/、/g, ' | ')
    .replace(/克/g, 'g')
  return options
}
