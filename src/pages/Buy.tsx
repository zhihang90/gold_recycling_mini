import {
  Button,
  Card,
  Chip,
  ChipRow,
  MediaVisual,
  PriceText,
  SupportFab,
  TabPage,
  Toast,
} from '@/components'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useLiveGoldPrice } from '@/hooks/useLiveGoldPrice'
import { addToCart } from '@/mocks/cart'
import { writeCheckout } from '@/mocks/checkout'
import { GOLD_PRODUCTS, SHOP_CATEGORIES, variantsOf } from '@/mocks/goldShop'
import type { GoldWeight } from '@/mocks/goldShop'
import { readMember } from '@/mocks/member'
import { quoteByCode, quoteChange } from '@/mocks/market'
import { feePerGram, goldPriceUpdatedAt } from '@/mocks/pricing'
import { buyDetailPath, loginRedirectState, paths } from '@/routes/paths'

/** 买金：投资金条按克重售卖，五档各一个商品，无规格选择。 */
export function BuyPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<0 | GoldWeight>(0)
  const [toast, setToast] = useState<string | null>(null)
  /** 上金所 Au99.99 实时价：与行情页、详情页共用同一金价模型 */
  useLiveGoldPrice()
  const liveAu = quoteChange(quoteByCode('au9999')!)
  const updatedAt = formatClock(new Date(goldPriceUpdatedAt()))

  const products = GOLD_PRODUCTS.filter((product) => category === 0 || product.grams === category)

  /** 交易类操作需登录：未登录直接去登录页，登录后回跳当前页 */
  const requireLogin = (action: () => void) => {
    if (!readMember()) {
      navigate(paths.login, { state: loginRedirectState() })
      return
    }
    action()
  }

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

      <div className="space-y-2.5">
        <ChipRow className="gap-1.5">
          {SHOP_CATEGORIES.map((item) => (
            <Chip
              key={item.value}
              active={category === item.value}
              className="px-2.5"
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </Chip>
          ))}
        </ChipRow>
      </div>

      <div className="space-y-3">
        {products.map((product) => {
          const variant = variantsOf(product)[0]
          return (
            <Card key={product.id} padding="none" className="overflow-hidden">
              <div className="p-3">
                <Link
                  to={buyDetailPath(product.id)}
                  className="-m-1 flex min-w-0 items-start gap-3 rounded-md p-1 active:bg-surface-2"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
                    <MediaVisual
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full bg-gold-50"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="line-clamp-2 text-label font-semibold text-ink-900">
                        {product.name}
                      </h2>
                      <span className="flex shrink-0 items-center gap-1">
                        {['质检证书', '可溯源'].map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gold-50 px-1.5 py-0.5 text-micro text-gold-700 ring-1 ring-gold-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    </div>
                    <p className="mt-1 text-caption text-subtle-foreground">{product.caption}</p>
                    <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="flex items-baseline">
                        <PriceText value={variant.price} size="body" tone="price" />
                        <span className="ml-0.5 text-micro text-subtle-foreground">/ 件</span>
                      </span>
                      <span className="text-micro text-subtle-foreground">
                        工费 {feePerGram(product.grams)} 元/克
                      </span>
                    </p>
                  </div>
                </Link>

                <div className="mt-2.5 flex items-center justify-end gap-2 border-t border-border-subtle pt-2.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      requireLogin(() => {
                        addToCart(product.id, variant.id, 1)
                        setToast(`已加入购物车 · ${product.grams}克`)
                      })
                    }
                  >
                    加入购物车
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      requireLogin(() => {
                        writeCheckout([
                          { productId: product.id, variantId: variant.id, quantity: 1 },
                        ])
                        navigate(paths.checkout)
                      })
                    }
                  >
                    立即购买
                  </Button>
                </div>
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

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />

      <SupportFab />
    </TabPage>
  )
}

/** 更新时间：北京时间，精确到秒 */
function formatClock(date: Date) {
  return date.toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai', hour12: false })
}
