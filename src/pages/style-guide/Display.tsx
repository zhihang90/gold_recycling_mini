import { BottomSheet, Button, Gallery, KeyValueRow, ListItem, MediaVisual, PriceText } from '@/components'
import { useState } from 'react'
import { CreditCard, MessageSquare, ShieldCheck } from 'lucide-react'

import { ASSAY_IMAGES } from './data'
import { GuideFooter, GuidePage, Section } from './shared'

/** 展示组件：列表、键值、图片与弹层容器 */
export function DisplayGuidePage() {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <GuidePage title="展示组件">
      <Section title="列表项 ListItem">
        <div className="overflow-hidden rounded-md ring-1 ring-border">
          <ListItem title="实名认证" description="已实名，信息变更需审核" icon={ShieldCheck} showArrow divider />
          <ListItem title="收款银行卡" description="尾号 0000" icon={CreditCard} right="已绑定" showArrow divider />
          <ListItem title="客服与投诉" icon={MessageSquare} showArrow />
        </div>
      </Section>

      <Section title="键值行 KeyValueRow">
        <div className="divide-y divide-line-soft">
          <KeyValueRow label="订单编号" value="示例 0000 0000" />
          <KeyValueRow label="预估克重" value="12.68 克" />
          <KeyValueRow label="预估金额" value={<PriceText value={7969.38} size="body" tone="ink" />} emphasis />
          <KeyValueRow label="结算说明" value="确认后 1 个工作日内付款" hint="示例" />
        </div>
      </Section>

      <Section title="媒体图 MediaVisual">
        <div className="grid grid-cols-3 gap-2">
          {ASSAY_IMAGES.map((src, index) => (
            <MediaVisual
              key={src}
              src={src}
              alt={`示例物品 ${index + 1}`}
              className="overflow-hidden rounded-md"
            />
          ))}
        </div>
        <div className="text-caption text-subtle-foreground">
          固定宽高比 + 懒加载；图片加载失败时隐藏，不出现破图。
        </div>
      </Section>

      <Section title="图库 Gallery / 弹层 BottomSheet">
        <Gallery
          images={ASSAY_IMAGES.map((src) => ({ src, alt: '示例图片' }))}
          className="overflow-hidden rounded-md"
        />
        <Button variant="secondary" block onClick={() => setPreviewOpen(true)}>
          在弹层中查看
        </Button>
        <div className="text-caption text-subtle-foreground">
          弹层已处理滚动锁定、返回键与下滑关闭，页面不要自己写 fixed。
        </div>
      </Section>

      <GuideFooter>图片仅作占位演示，不接业务图片资源</GuideFooter>

      <BottomSheet open={previewOpen} onClose={() => setPreviewOpen(false)} title="物品照片">
        <Gallery
          images={ASSAY_IMAGES.map((src) => ({ src, alt: '示例图片' }))}
          className="overflow-hidden rounded-md"
        />
        <div className="mt-3 text-caption text-subtle-foreground">
          示例：影像仅用于核对结论与留痕，不提供原图下载。
        </div>
      </BottomSheet>
    </GuidePage>
  )
}
