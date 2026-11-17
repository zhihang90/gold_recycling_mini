import { useState } from 'react'
import { BadgeCheck, FileCheck2, Recycle, Truck } from 'lucide-react'
import { TabPage } from '@/components/TabPage'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { ListItem } from '@/components/ListItem'
import { MediaVisual } from '@/components/MediaVisual'
import { PriceText } from '@/components/PriceText'
import { images } from '@/assets/images'
import { GOLD_PRODUCTS, SALE_RATE, SHOP_CATEGORIES, SHOP_TRUST } from '@/mocks/goldShop'
import type { GoldCategory } from '@/mocks/goldShop'
import { cn } from '@/lib/utils'

const TRUST_ICON = {
  assay: BadgeCheck,
  cert: FileCheck2,
  recycle: Recycle,
  delivery: Truck,
} as const

/** 买金：投资金销售入口，与回收共用同一账号与订单体系。 */
export function BuyPage() {
  const [category, setCategory] = useState<'all' | GoldCategory>('all')
  const products = GOLD_PRODUCTS.filter(
    (product) => category === 'all' || product.category === category,
  )

  return (
    <TabPage title="买金">
      <div className="relative overflow-hidden rounded-lg">
        <MediaVisual
          src={images.buyHero}
          alt="投资金新品"
          ratio="wide"
          priority
          className="h-40 w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <Badge tone="warning">新品发售</Badge>
          <p className="mt-2 font-serif text-section text-paper">投资金条 · 生肖金币</p>
          <p className="mt-1 text-caption text-paper/70">足金 999.9 · 一物一证 · 支持回收变现</p>
        </div>
      </div>

      <Card className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-caption text-muted-foreground">今日销售金价</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <PriceText value={SALE_RATE.price} size="title" />
            <span className="text-caption text-muted-foreground">元/克</span>
          </div>
          <p className="mt-1 text-caption text-subtle-foreground">
            {SALE_RATE.source} · {SALE_RATE.updatedAt}
          </p>
        </div>
        <Badge tone="outline">按克计价</Badge>
      </Card>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {SHOP_CATEGORIES.map((item) => (
          <Button
            key={item.value}
            size="sm"
            variant={category === item.value ? 'primary' : 'tertiary'}
            className={cn(category !== item.value && 'bg-surface')}
            onClick={() => setCategory(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <Card key={product.id} padding="none" className="overflow-hidden">
            <MediaVisual src={product.image} alt={product.name} />
            <div className="p-3">
              <h2 className="line-clamp-2 text-body-strong text-foreground">{product.name}</h2>
              <p className="mt-1 text-caption text-muted-foreground">{product.spec}</p>
              <div className="mt-2">
                <PriceText value={product.price} size="body" tone="price" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="none">
        <div className="px-4 pt-3">
          <h2 className="text-card-title text-foreground">安盛华投资金</h2>
          <p className="mt-1 text-caption text-subtle-foreground">
            投资金与黄金回收在同一平台完成，买金、变现共用一个账号。
          </p>
        </div>
        <div className="mt-1">
          {SHOP_TRUST.map((item) => {
            const Icon = TRUST_ICON[item.key]
            return (
              <ListItem
                key={item.key}
                icon={Icon}
                title={item.title}
                description={item.description}
              />
            )
          })}
        </div>
      </Card>

      <p className="text-caption text-subtle-foreground">
        销售金价随上海金价浮动，最终以提交订单时的价格为准；投资金不支持七天无理由退货。
      </p>
    </TabPage>
  )
}
