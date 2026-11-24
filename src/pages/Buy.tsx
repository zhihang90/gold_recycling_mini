import {
  Badge,
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
import { useState } from 'react'
import { ShoppingCart, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { images } from '@/assets/images'

import { addToCart } from '@/mocks/cart'
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
  const products = GOLD_PRODUCTS.filter(
    (product) => category === 'all' || product.category === category,
  )

  return (
    <TabPage>
      <div className="relative -mx-4 -mt-4 overflow-hidden">
        <MediaVisual
          src={images.buyHero}
          alt="丁未羊年贺岁金条"
          ratio="wide"
          priority
          className="h-44 w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gold-900/90 via-gold-900/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-5">
          <p className="text-caption text-gold-200">安盛华投资金</p>
          <p className="mt-1 font-serif text-title text-paper">丁未羊年 · 贺岁金条</p>
          <p className="mt-1 text-caption text-gold-100/80">足金 999.9 · 一物一证 · 支持回收变现</p>
          <div className="mt-3">
            <Badge tone="gold">新品发售</Badge>
          </div>
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

/** 商品卡的规格行：从 caption 提取克重选项，统一成竞品「5g | 10g | …」的写法。 */
function cardSpec(caption: string) {
  const options = caption
    .replace(/^.*规格：/, '')
    .replace(/、/g, ' | ')
    .replace(/克/g, 'g')
  return options
}
