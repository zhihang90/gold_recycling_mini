import { Pencil, Trash2 } from 'lucide-react'
import { maskPhone, type ShippingAddress } from '@/mocks/addressBook'
import { Card } from './Card'
import { RadioRow } from './RadioRow'
import { TextLink } from './TextLink'

/**
 * 地址簿卡片：姓名手机、完整地址、公司名称，底部为默认选择与编辑 / 删除。
 * 只负责展示与回调，默认地址的唯一性由页面调用 setDefaultAddress 维护。
 */
export function AddressBookCard({
  address,
  isDefault,
  onToggleDefault,
  onEdit,
  onDelete,
}: {
  address: ShippingAddress
  isDefault: boolean
  onToggleDefault: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card padding="md" className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-body-strong text-foreground">{address.name}</span>
        <span className="text-body text-muted-foreground tabular">{maskPhone(address.phone)}</span>
      </div>

      <p className="text-body text-muted-foreground">
        {address.region} {address.place}
        {address.doorNo ? ` ${address.doorNo}` : ''}
      </p>

      {address.company ? (
        <p className="text-body text-muted-foreground">公司名称：{address.company}</p>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-1">
        <RadioRow
          label="默认寄件地址"
          name="default-address"
          checked={isDefault}
          onChange={onToggleDefault}
        />
        <div className="flex items-center gap-4">
          <TextLink onClick={onEdit}>
            <Pencil size={14} aria-hidden="true" />
            编辑
          </TextLink>
          <TextLink onClick={onDelete} className="text-destructive">
            <Trash2 size={14} aria-hidden="true" />
            删除
          </TextLink>
        </div>
      </div>
    </Card>
  )
}
