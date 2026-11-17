import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { images } from '@/assets/images'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { DetailPage } from '@/components/DetailPage'
import { InlineNotice } from '@/components/InlineNotice'
import { SegmentedTabs } from '@/components/SegmentedTabs'
import { UploadGroup } from '@/components/UploadGroup'
import { GOLD_SOURCES } from '@/mocks/shipping'
import { paths } from '@/routes/paths'

/**
 * 上传实物照片：正面图 / 反面图分槽上传，发票与来源用于合规留存。
 * 照片只保存在本地内存，不上传真实接口。
 */
export function ShipPhotosPage() {
  const navigate = useNavigate()
  const [front, setFront] = useState<string[]>([])
  const [back, setBack] = useState<string[]>([])
  const [invoice, setInvoice] = useState<string[]>([])
  const [source, setSource] = useState('self')

  return (
    <DetailPage
      title="上传实物照片"
      footer={
        <Button size="lg" block onClick={() => navigate(paths.ship.contract)}>
          签署协议
        </Button>
      }
    >
      <InlineNotice tone="warning">应国家回收黄金规定，请补充以下信息</InlineNotice>

      <UploadGroup
        title="黄金实物图"
        description="请上传黄金实物图片，需最少 1 张正面图、1 张反面图"
        required
        slots={[
          { key: 'front', label: '正面图', value: front, onChange: setFront, min: 1, max: 1 },
          { key: 'back', label: '反面图', value: back, onChange: setBack, min: 1, max: 1 },
        ]}
      />

      <UploadGroup
        title="电子或纸质发票"
        description="下单克重需与发票一致，找不到发票可以不传"
        max={2}
        examples={[{ src: images.invoiceSample, alt: '发票示例' }]}
        value={invoice}
        onChange={setInvoice}
      />

      <Card padding="md" className="space-y-3">
        <h2 className="text-card-title text-foreground">黄金来源</h2>
        <SegmentedTabs items={GOLD_SOURCES} value={source} onChange={setSource} wrap />
      </Card>

      <p className="text-caption text-subtle-foreground">
        以上信息仅用于回收黄金，我们将予以加密保护。
      </p>
    </DetailPage>
  )
}
