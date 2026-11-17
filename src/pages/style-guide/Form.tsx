import { useState } from 'react'
import { Button } from '@/components/Button'
import { FormField } from '@/components/FormField'
import { SelectField } from '@/components/SelectField'
import { ChoiceGroup } from '@/components/ChoiceGroup'
import { SwitchField } from '@/components/SwitchField'
import { ListItem } from '@/components/ListItem'
import { PickerSheet } from '@/components/PickerSheet'
import { AgreementCheck } from '@/components/AgreementCheck'
import { PhotoUploader } from '@/components/PhotoUploader'
import { GuideFooter, GuidePage, Section } from './shared'

const CATEGORY_OPTIONS = [
  { value: 'jewelry', label: '足金首饰', description: '仅收足金，K 金与镶嵌类暂不支持' },
  { value: 'bar', label: '投资金条 / 金币', description: '纪念金币按原料金口径估价' },
  { value: 'other', label: '其他品类', description: '首期未开放', disabled: true },
]

/** 表单组件：填写、勾选、选择与上传 */
export function FormGuidePage() {
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [agreementError, setAgreementError] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [settlement, setSettlement] = useState('bank')
  const [remind, setRemind] = useState(true)
  const [photos, setPhotos] = useState<string[]>([])

  const selectedCategory = CATEGORY_OPTIONS.find((item) => item.value === category)

  return (
    <GuidePage title="表单组件">
      <Section title="输入与表单 FormField">
        <FormField
          label="预估重量"
          value={weight}
          onChange={setWeight}
          unit="克"
          placeholder="0.00"
          inputMode="decimal"
          hint="仅用于初步估价，最终以签收复称与检测为准"
          required
        />
        <FormField label="备注" value={note} onChange={setNote} multiline placeholder="选填" />
      </Section>

      <Section title="选择框 SelectField">
        <SelectField
          label="回收品类"
          value={category}
          onChange={setCategory}
          options={CATEGORY_OPTIONS}
          hint="少于 6 项用原生选择框；选项带说明或超过 6 项改用 PickerSheet"
          required
        />
      </Section>

      <Section title="单选组 ChoiceGroup">
        <ChoiceGroup
          label="结算方式"
          value={settlement}
          onChange={setSettlement}
          options={[
            { value: 'bank', label: '银行卡', description: '预计 1 个工作日内到账' },
            { value: 'alipay', label: '支付宝', description: '即时到账，需与实名信息一致' },
          ]}
          required
        />
      </Section>

      <Section title="开关 SwitchField">
        <SwitchField
          label="到店前电话提醒"
          description="门店确认预约后致电，不发送营销信息"
          checked={remind}
          onChange={setRemind}
        />
      </Section>

      <Section title="协议勾选 AgreementCheck">
        <AgreementCheck
          checked={agreed}
          onChange={(next) => {
            setAgreed(next)
            if (next) setAgreementError('')
          }}
          error={agreementError}
        >
          我已阅读并同意《服务协议》《隐私政策》，并确认已知悉破检授权与不可还原提示。
        </AgreementCheck>
        <div className="flex items-center justify-between gap-3">
          <span className="text-caption text-subtle-foreground">未勾选时由页面给出错误文案</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setAgreementError(agreed ? '' : '请先勾选协议与授权')}
          >
            校验
          </Button>
        </div>
      </Section>

      <Section title="选择弹层 PickerSheet">
        <ListItem
          title="回收品类"
          description={selectedCategory?.description ?? '用于演示单选确认制'}
          right={selectedCategory?.label ?? '请选择'}
          showArrow
          onClick={() => setPickerOpen(true)}
        />
      </Section>

      <Section title="照片上传 PhotoUploader">
        <PhotoUploader value={photos} onChange={setPhotos} hint="最多 6 张，仅本地预览" />
      </Section>

      <GuideFooter>表单组件只负责输入与校验展示，提交逻辑由业务页决定</GuideFooter>

      <PickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="选择回收品类"
        options={CATEGORY_OPTIONS}
        value={category}
        onConfirm={setCategory}
        footnote="非开放品类不进入提交流程。"
      />
    </GuidePage>
  )
}
