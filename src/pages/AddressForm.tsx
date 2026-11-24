import {
  Button,
  Card,
  DetailPage,
  FormField,
  PasteRecognizeBox,
  PickerSheet,
  RadioRow,
  TextLink,
  Toast,
} from '@/components'
import { useState } from 'react'
import { ChevronRight, MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { isPhoneNumber } from '@/lib/validation'
import {
  REGION_OPTIONS,
  readAddresses,
  readSelectedAddressId,
  setDefaultAddress,
  writeAddresses,
  type ShippingAddress,
} from '@/mocks/addressBook'
import { paths } from '@/routes/paths'

/** 演示用的地址文本：点「粘贴并识别」时自动填入并拆分 */
const DEMO_PASTE = '张三 17688825090 广东省深圳市盐田区深盐路2088号太平洋工业区3栋601'

/** 右侧竖向图标动作：定位，图标在上、红色短标签在下 */
function SideAction({
  icon: Icon,
  label,
  onClick,
  tone = 'muted',
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  tone?: 'muted' | 'primary'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-10 shrink-0 flex-col items-center justify-center gap-0.5 transition active:opacity-70"
    >
      <Icon
        size={18}
        aria-hidden="true"
        className={tone === 'primary' ? 'text-primary' : 'text-icon-strong'}
      />
      <span
        aria-hidden="true"
        className={cn(
          'text-caption',
          tone === 'primary' ? 'text-primary' : 'text-subtle-foreground',
        )}
      >
        {label}
      </span>
    </button>
  )
}

/**
 * 地址新增 / 编辑：粘贴识别 + 联系人信息卡（姓名、手机号、省市区、详细地址、门牌号、公司）。
 * 省市区走模拟选择器，定位只填入演示数据，不申请系统权限。
 */
export function AddressFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editingId = searchParams.get('id')
  const editing = editingId
    ? readAddresses().find((address) => address.id === editingId)
    : undefined

  const [pasteText, setPasteText] = useState('')
  const [recognizeHint, setRecognizeHint] = useState<{ error: boolean; text: string } | null>(null)
  const [region, setRegion] = useState(editing?.region ?? '')
  const [place, setPlace] = useState(editing?.place ?? '')
  const [doorNo, setDoorNo] = useState(editing?.doorNo ?? '')
  const [company, setCompany] = useState(editing?.company ?? '')
  const [name, setName] = useState(editing?.name ?? '')
  const [phone, setPhone] = useState(editing?.phone ?? '')
  const [regionOpen, setRegionOpen] = useState(false)
  const [isDefault, setIsDefault] = useState(() =>
    editing ? readSelectedAddressId() === editing.id : readAddresses().length === 0,
  )
  /** 保存中：按钮转圈并禁用，避免重复写入 */
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const phoneValid = isPhoneNumber(phone)

  const handleRecognize = () => {
    const raw = pasteText.trim() || DEMO_PASTE
    if (!pasteText.trim()) setPasteText(DEMO_PASTE)

    const phoneHit = raw.match(/1\d{10}/)?.[0]
    if (!phoneHit) {
      setRecognizeHint({ error: true, text: '未识别到手机号，请检查文本后重试' })
      return
    }

    const compact = raw.replace(/\s/g, '')
    const phoneIndex = compact.indexOf(phoneHit)
    const nameText = compact
      .slice(0, phoneIndex)
      .replace(/[，,。;；:：]/g, ' ')
      .trim()
    const rest = compact.slice(phoneIndex + phoneHit.length)
    const regionHit = REGION_OPTIONS.find((option) =>
      rest.startsWith(option.value.replace(/\s/g, '')),
    )
    let detail = regionHit ? rest.slice(regionHit.value.replace(/\s/g, '').length) : rest

    if (!doorNo && detail) {
      const doorHit = detail.match(/(\d+)$/)
      if (doorHit) {
        setDoorNo(doorHit[1])
        detail = detail.slice(0, doorHit.index)
      }
    }

    if (nameText) setName(nameText)
    setPhone(phoneHit)
    if (regionHit) setRegion(regionHit.value)
    if (detail) setPlace(detail)
    setRecognizeHint({ error: false, text: '已识别姓名、手机号与地址，请核对后保存' })
  }

  const fillLocation = () => {
    setRegion('广东省 深圳市 盐田区')
    if (!place) setPlace('深盐路2088号太平洋工业区')
  }

  const handleClear = () => {
    setPasteText('')
    setRecognizeHint(null)
    setName('')
    setPhone('')
    setRegion('')
    setPlace('')
    setDoorNo('')
    setCompany('')
  }

  const handleSave = () => {
    if (!name.trim()) {
      setToast('请输入联系人姓名')
      return
    }
    if (!phoneValid) {
      setToast('请输入正确的手机号')
      return
    }
    if (!region) {
      setToast('请选择所在地区')
      return
    }
    if (!place.trim()) {
      setToast('请输入详细地址')
      return
    }

    const next: ShippingAddress = {
      id: editing?.id ?? `addr-${Date.now()}`,
      name: name.trim(),
      phone,
      region,
      place: place.trim(),
      doorNo: doorNo.trim(),
      company: company.trim() || undefined,
      tag: editing?.tag,
    }

    const addresses = readAddresses()
    writeAddresses(
      editing
        ? addresses.map((address) => (address.id === editing.id ? next : address))
        : [...addresses, next],
    )

    if (isDefault) setDefaultAddress(next.id)

    // 保存中：按钮转圈并禁用，避免重复写入
    setSaving(true)
    window.setTimeout(() => navigate(paths.ship.addresses), 500)
  }

  return (
    <>
      <DetailPage
        title={editing ? '编辑地址' : '新增地址'}
        footer={
          <Button size="lg" block loading={saving} onClick={handleSave}>
            确定
          </Button>
        }
      >
        <PasteRecognizeBox
          value={pasteText}
          onChange={setPasteText}
          onRecognize={handleRecognize}
          hint={recognizeHint?.text ?? '支持一次粘贴姓名、手机号与地址'}
          error={recognizeHint?.error}
        />

        <Card padding="md" className="space-y-1">
          <h2 className="pb-2 text-card-title text-foreground">联系人信息</h2>

          <div className="grid grid-cols-2 gap-3">
            <FormField bare label="真实姓名" value={name} onChange={setName} required />
            <FormField
              bare
              label="手机号"
              value={phone}
              onChange={setPhone}
              type="tel"
              inputMode="tel"
              maxLength={11}
              required
              className="border-l border-border-subtle pl-3"
              error={phone.length === 11 && !phoneValid ? '手机号格式不正确' : undefined}
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setRegionOpen(true)}
              className="flex h-11 min-w-0 flex-1 items-center justify-between gap-2 border-b border-border-subtle text-left transition"
            >
              <span
                className={cn(
                  'truncate text-body',
                  region ? 'text-foreground' : 'text-subtle-foreground',
                )}
              >
                {region || '省市区'}
              </span>
              <ChevronRight size={16} className="shrink-0 text-icon-muted" aria-hidden="true" />
            </button>
            <SideAction icon={MapPin} label="定位" onClick={fillLocation} tone="primary" />
          </div>

          <FormField
            bare
            label="详细地址"
            value={place}
            onChange={setPlace}
            placeholder="详细地址（例如 **街 ** 号）"
            required
          />
          <FormField
            bare
            label="门牌号"
            value={doorNo}
            onChange={setDoorNo}
            placeholder="门牌号（选填）（例如：xx栋xx室）"
          />
          <FormField
            bare
            label="公司名称"
            value={company}
            onChange={setCompany}
            placeholder="公司名称（选填）"
          />

          <div className="flex items-center justify-between gap-3 pt-2">
            <RadioRow
              label="默认寄件地址"
              name="default-address"
              checked={isDefault}
              onChange={() => setIsDefault(true)}
            />
            <TextLink onClick={handleClear}>清空</TextLink>
          </div>
        </Card>

        <PickerSheet
          open={regionOpen}
          onClose={() => setRegionOpen(false)}
          title="选择省市区"
          options={REGION_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
          value={region}
          onConfirm={setRegion}
        />
      </DetailPage>

      <Toast open={!!toast} message={toast ?? ''} onClose={() => setToast(null)} />
    </>
  )
}
