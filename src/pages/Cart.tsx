import { BottomActionBar, Button, MediaVisual, PriceText, Stepper, TabPage, TextLink } from '@/components'
import { useState } from 'react'
import { Check, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { DEMO_CART, readCart, writeCart, type CartItem } from '@/mocks/cart'
import { writeCheckout } from '@/mocks/checkout'
import { GOLD_PRODUCTS, SALE_RATE, findVariant } from '@/mocks/goldShop'
import { cn } from '@/lib/utils'
import { useDemoScene } from '@/lib/useDemoScene'
import { paths } from '@/routes/paths'

/** 圆形勾选：购物车逐项与全选共用，点击热区用伪元素补到 44。 */
function CartCheck({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition after:absolute after:-inset-2 after:content-[""]',
        checked
          ? 'border-gold-700 bg-gold-700 text-gold-50'
          : 'border-border-subtle bg-card',
      )}
    >
      {checked ? <Check size={12} strokeWidth={3} /> : null}
    </button>
  )
}

/** 购物车：买金商品暂存与结算入口，中间悬浮购物车按钮的落点页面。 */
export function CartPage() {
  const navigate = useNavigate()
  const demoScene = useDemoScene()
  const [items, setItems] = useState<CartItem[]>(() =>
    demoScene === 'cart' ? DEMO_CART : readCart(),
  )
  const [managing, setManaging] = useState(false)

  const rows = items.flatMap((item) => {
    const product = GOLD_PRODUCTS.find((entry) => entry.id === item.productId)
    const variant = product ? findVariant(product, item.variantId) : undefined
    return product && variant ? [{ item, product, variant }] : []
  })

  const selectedRows = rows.filter((row) => row.item.selected)
  const selectedCount = selectedRows.reduce((total, row) => total + row.item.quantity, 0)
  const total = selectedRows.reduce(
    (sum, row) => sum + row.variant.price * row.item.quantity,
    0,
  )
  const allSelected = rows.length > 0 && rows.every((row) => row.item.selected)
  const empty = rows.length === 0

  const update = (next: CartItem[]) => {
    setItems(next)
    if (demoScene !== 'cart') writeCart(next)
  }

  const toggleItem = (variantId: string) => {
    update(
      items.map((item) =>
        item.variantId === variantId ? { ...item, selected: !item.selected } : item,
      ),
    )
  }

  const toggleAll = () => {
    update(items.map((item) => ({ ...item, selected: !allSelected })))
  }

  const changeQuantity = (variantId: string, quantity: number) => {
    update(
      items.map((item) => (item.variantId === variantId ? { ...item, quantity } : item)),
    )
  }

  const removeItem = (variantId: string) => {
    update(items.filter((item) => item.variantId !== variantId))
  }

  return (
    <TabPage
      title="购物车"
      right={
        empty ? undefined : (
          <TextLink onClick={() => setManaging((prev) => !prev)}>
            {managing ? '完成' : '管理'}
          </TextLink>
        )
      }
      contentClassName="flex flex-1 flex-col space-y-0 pb-0 pt-3"
    >
      <div className="mb-3 flex items-center justify-between gap-3 rounded-md bg-gold-50 px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-caption-strong text-gold-800">实时销售金价（元/克）</p>
          <p className="mt-0.5 text-caption text-gold-600">更新于 {SALE_RATE.updatedAt}</p>
        </div>
        <PriceText value={SALE_RATE.price} size="title" tone="gold" />
      </div>

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center pb-16">
          <ShoppingCart size={72} strokeWidth={1.2} className="text-gold-200" />
          <p className="mt-4 text-body text-muted-foreground">购物车空空如也，去逛逛吧～</p>
          <Button
            variant="tertiary"
            className="mt-4 rounded-full bg-gold-50 px-6 text-gold-800 ring-1 ring-gold-300"
            onClick={() => navigate(paths.buy)}
          >
            去逛买金
          </Button>
        </div>
      ) : (
        <div className="flex-1 space-y-3">
          {rows.map(({ item, product, variant }) => (
            <div
              key={item.variantId}
              className="flex items-start gap-3 rounded-lg bg-card p-3 shadow-sm ring-1 ring-border-subtle"
            >
              <span className="pt-6">
                <CartCheck
                  checked={item.selected}
                  label={`选择 ${product.name} 规格 ${variant.label}`}
                  onChange={() => toggleItem(item.variantId)}
                />
              </span>
              <MediaVisual
                src={product.image}
                alt={product.name}
                className="h-20 w-20 shrink-0 rounded-md bg-gold-100"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-body-strong text-foreground">{product.name}</p>
                <p className="mt-1 truncate text-caption text-subtle-foreground">
                  规格 {variant.label}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <PriceText value={variant.price} size="body" tone="gold" />
                  {managing ? (
                    <TextLink
                      className="text-destructive"
                      onClick={() => removeItem(item.variantId)}
                    >
                      删除
                    </TextLink>
                  ) : (
                    <Stepper
                      size="sm"
                      value={item.quantity}
                      max={Math.min(20, variant.stock)}
                      onChange={(value) => changeQuantity(item.variantId, value)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomActionBar className="bottom-2 mt-3 rounded-xl border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CartCheck checked={allSelected} label="全选" onChange={toggleAll} />
            <span className="text-body text-foreground">全选</span>
          </div>
          <div className="ml-auto flex items-baseline gap-1">
            <span className="text-caption text-subtle-foreground">合计</span>
            <PriceText value={total} size="section" tone="price" />
          </div>
          <Button
            className="h-10 shrink-0 rounded-full bg-gold-800 px-5 text-gold-50"
            disabled={selectedCount === 0}
            onClick={() => {
              writeCheckout(
                selectedRows.map(({ item, product, variant }) => ({
                  productId: product.id,
                  variantId: variant.id,
                  quantity: item.quantity,
                })),
              )
              navigate(paths.checkout)
            }}
          >
            去结算({selectedCount})
          </Button>
        </div>
      </BottomActionBar>
    </TabPage>
  )
}
