import {
  Button,
  Card,
  DetailPage,
  FormField,
  InlineNotice,
  PhotoUploader,
  Toast,
} from '@/components'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { readMember } from '@/mocks/member'
import { submitSupportFeedback } from '@/mocks/support'
import { routePath } from '@/routes/paths'

/** 投诉与建议：关联订单 + 描述 + 图片凭证，提交后回到客服首页 */
export function SupportFeedbackPage() {
  const navigate = useNavigate()
  const [member] = useState(() => readMember())
  const [orderId, setOrderId] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [phone, setPhone] = useState(member?.phone ?? '')
  const [toast, setToast] = useState<string | null>(null)

  const submit = () => {
    if (description.trim().length < 5) {
      setToast('请至少填写 5 个字的问题描述')
      return
    }
    if (!phone.trim()) {
      setToast('请填写联系电话')
      return
    }

    submitSupportFeedback({
      type: 'complaint',
      orderId: orderId.trim() || undefined,
      description: description.trim(),
      images,
      phone: phone.trim(),
    })
    navigate(routePath('support.home'), {
      state: { toast: '已收到你的反馈，我们将在 1 个工作日内联系你' },
    })
  }

  return (
    <DetailPage
      title="投诉与建议"
      footer={
        <Button block onClick={submit}>
          提交
        </Button>
      }
    >
      <InlineNotice tone="info" title="我们重视每一条反馈">
        投诉与建议会由客诉专员跟进，处理进度将通过消息中心和预留电话同步。
      </InlineNotice>

      <Card padding="md" className="space-y-4">
        <FormField
          label="关联订单号（选填）"
          value={orderId}
          onChange={setOrderId}
          placeholder="如 SO20261112002 或 RC20261119012"
        />
        <FormField
          label="问题描述"
          value={description}
          onChange={setDescription}
          multiline
          rows={5}
          maxLength={300}
          required
          placeholder="请描述遇到的问题、发生时间，以及你希望如何处理"
        />
        <div className="space-y-2">
          <p className="text-body-strong text-foreground">图片凭证（选填）</p>
          <PhotoUploader
            value={images}
            onChange={setImages}
            max={3}
            hint="最多上传 3 张，支持订单截图、商品照片或聊天记录"
          />
        </div>
      </Card>

      <Card padding="md">
        <FormField
          label="联系电话"
          value={phone}
          onChange={setPhone}
          type="tel"
          inputMode="tel"
          required
          placeholder="便于客诉专员与你联系"
        />
      </Card>

      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </DetailPage>
  )
}
