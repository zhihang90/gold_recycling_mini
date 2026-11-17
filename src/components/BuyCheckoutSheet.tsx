/**
 * @deprecated 已于 2026-11 废弃，不再被任何页面引用。
 * 下单确认功能统一由 src/pages/BuyCheckout.tsx 全屏页承载。
 * 本文件保留仅作历史备份，不应被新代码 import。
 */
import { AddressCard, BottomSheet, Button, FormField, MediaVisual, PriceText, Stepper, TextLink } from '@/components'
import { useEffect, useState } from 'react'
import { CheckCircle2, ShieldCheck } from 'lucide-react'

import {
  DEFAULT_ADDRESSES,
  maskPhone,
  readAddresses,
  readSelectedAddress,
  selectAddress,
  type ShippingAddress,
} from '@/mocks/addressBook'
import type { GoldProduct, GoldVariant } from '@/mocks/goldShop'

export interface CheckoutItem {
  product: GoldProduct
  variant: GoldVariant
  quantity: number
}

/** 立即购买与购物车结算共用的订单确认层；仅演示提交，不发起真实支付。 */
export function BuyCheckoutSheet({
  open,
  items,
  onClose,
  onQuantityChange,
  onSubmit,
}: {
  open: boolean
  items: CheckoutItem[]
  onClose: () => void
  onQuantityChange?: (variantId: string, quantity: number) => void
  onSubmit?: () => void
}) {
  const [address, setAddress] = useState<ShippingAddress>(() => readSelectedAddress() ?? DEFAULT_ADDRESSES[0])
  const [addresses, setAddresses] = useState<ShippingAddress[]>(readAddresses)
  const [view, setView] = useState<'checkout' | 'address'>('checkout')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [successSummary, setSuccessSummary] = useState({ total: 0, count: 0 })

  useEffect(() => {
    if (!open) return
    setAddress(readSelectedAddress() ?? DEFAULT_ADDRESSES[0])
    setAddresses(readAddresses())
    setView('checkout')
    setNote('')
    setSubmitted(false)
  }, [open])

  const total = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  if (items.length === 0 && !submitted) return null

  const submit = () => {
    setSuccessSummary({ total, count })
    setSubmitted(true)
    onSubmit?.()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={submitted ? '订单提交成功' : view === 'address' ? '选择收货地址' : '确认订单'}
      footer={
        submitted ? (
          <Button block className="rounded-full bg-gold-800 text-gold-50" onClick={onClose}>
            完成
          </Button>
        ) : view === 'checkout' ? (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-caption text-subtle-foreground">共 {count} 件 · 免运费</p>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-caption text-foreground">合计</span>
                <PriceText value={total} size="section" tone="price" />
              </div>
            </div>
            <Button className="h-11 shrink-0 rounded-full bg-gold-800 px-6 text-gold-50" onClick={submit}>
              提交订单
            </Button>
          </div>
        ) : undefined
      }
    >
      {submitted ? (
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle2 size={56} strokeWidth={1.5} className="text-gold-700" />
          <h3 className="mt-4 text-section text-foreground">订单提交成功</h3>
          <p className="mt-2 text-body text-muted-foreground">演示订单已生成，无需支付</p>
          <div className="mt-4 rounded-md bg-gold-50 px-6 py-3">
            <PriceText value={successSummary.total} size="section" tone="price" />
            <p className="mt-1 text-caption text-subtle-foreground">共 {successSummary.count} 件商品</p>
          </div>
        </div>
      ) : view === 'address' ? (
        <div className="space-y-3">
          <TextLink onClick={() => setView('checkout')}>返回确认订单</TextLink>
          {addresses.map((item) => (
            <AddressCard
              key={item.id}
              name={item.name}
              phone={maskPhone(item.phone)}
              region={item.region}
              detail={`${item.place}${item.doorNo}`}
              tag={item.tag}
              mode="select"
              selected={item.id === address.id}
              onClick={() => {
                selectAddress(item.id)
                setAddress(item)
                setView('checkout')
              }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 rounded-md bg-gold-50 px-3 py-2 text-caption text-gold-800">
            <ShieldCheck size={14} className="shrink-0" />
            顺丰保价 · 一物一证 · 不支持 7 天无理由
          </div>

          <AddressCard
            name={address.name}
            phone={maskPhone(address.phone)}
            region={address.region}
            detail={`${address.place}${address.doorNo}`}
            tag={address.tag}
            mode="select"
            onClick={() => setView('address')}
            className="shadow-none"
          />

          <div className="space-y-3">
            {items.map(({ product, variant, quantity }) => (
              <div key={variant.id} className="flex gap-3 border-b border-border-subtle pb-3 last:border-0 last:pb-0">
                <MediaVisual
                  src={product.image}
                  alt={product.name}
                  className="h-20 w-20 shrink-0 rounded-md bg-gold-50"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-body-strong text-foreground">{product.name}</p>
                  <p className="mt-1 text-caption text-subtle-foreground">标称金重 {variant.label}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <PriceText value={variant.price} size="body" tone="price" />
                    {onQuantityChange ? (
                      <Stepper
                        size="sm"
                        value={quantity}
                        max={Math.min(20, variant.stock)}
                        onChange={(value) => onQuantityChange(variant.id, value)}
                      />
                    ) : (
                      <span className="text-body text-muted-foreground tabular">× {quantity}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-3">
            <span className="text-body text-foreground">配送</span>
            <span className="text-body text-muted-foreground">顺丰保价 · 免运费</span>
          </div>
          <FormField
            label="备注"
            value={note}
            onChange={setNote}
            inline
            bare
            placeholder="选填，建议先与商家协商一致"
          />
        </div>
      )}
    </BottomSheet>
  )
}
