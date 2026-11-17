import { BottomSheet, Button, MediaVisual, PriceText, Stepper } from '@/components'
import { ShieldCheck } from 'lucide-react'

import { cn } from '@/lib/utils'
import { variantsOf, type GoldProduct } from '@/mocks/goldShop'

/** 列表与详情共用的规格选择：只负责选择与确认，不把加购和购买混在同一弹层。 */
export function ProductSkuSheet({
  open,
  product,
  variantId,
  quantity,
  confirmLabel,
  onVariantChange,
  onQuantityChange,
  onClose,
  onConfirm,
}: {
  open: boolean
  product?: GoldProduct
  variantId: string
  quantity: number
  confirmLabel: string
  onVariantChange: (variantId: string) => void
  onQuantityChange: (quantity: number) => void
  onClose: () => void
  onConfirm: () => void
}) {
  if (!product) return null

  const variants = variantsOf(product)
  const variant = variants.find((item) => item.id === variantId) ?? variants[0]

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="选择规格"
      footer={
        <Button block className="rounded-full bg-gold-800 text-gold-50" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      }
    >
      <div className="flex gap-3">
        <MediaVisual
          src={product.image}
          alt={product.name}
          className="h-24 w-24 shrink-0 rounded-md bg-gold-50"
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-body-strong text-foreground">{product.name}</p>
          <div className="mt-1">
            <PriceText value={variant.price} size="section" tone="price" />
          </div>
          <p className="mt-1 text-caption text-subtle-foreground">
            已选 {variant.label} · {quantity} 件 · 库存 {variant.stock} 件
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 rounded-md bg-gold-50 px-3 py-2 text-caption text-gold-800">
        <ShieldCheck size={14} className="shrink-0" />
        顺丰保价 · 一物一证 · 不支持 7 天无理由
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-body-strong text-foreground">标称金重</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((item) => {
            const active = item.id === variant.id
            return (
              <Button
                key={item.id}
                size="sm"
                variant="tertiary"
                aria-pressed={active}
                className={cn(
                  'min-w-16 rounded-md px-4',
                  active
                    ? 'bg-primary-soft text-primary ring-1 ring-primary-border'
                    : 'bg-surface-2 text-foreground ring-0',
                )}
                onClick={() => {
                  onVariantChange(item.id)
                  onQuantityChange(Math.min(quantity, Math.min(20, item.stock)))
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-body-strong text-foreground">数量</p>
          <p className="mt-0.5 text-caption text-subtle-foreground">每笔订单最多 20 件</p>
        </div>
        <Stepper
          value={quantity}
          max={Math.min(20, variant.stock)}
          onChange={onQuantityChange}
        />
      </div>
    </BottomSheet>
  )
}
