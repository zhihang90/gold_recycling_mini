import { MapPinPlus } from 'lucide-react'
import type { RefObject } from 'react'

import { maskPhone, type ShippingAddress } from '@/mocks/addressBook'

import { AddressCard } from './AddressCard'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'

/**
 * 地址选择抽屉：买金提交订单与黄金回收估价共用。
 * 空态时显示提示 + 底部添加入口；有地址时正常列出并高亮当前选中项。
 */
export function AddressPickerSheet({
  open,
  onClose,
  addresses,
  selectedId,
  onSelect,
  onAdd,
  title = '选择收货地址',
  extraScrollLocks,
  disablePortal,
}: {
  open: boolean
  onClose: () => void
  addresses: ShippingAddress[]
  selectedId: string | null
  onSelect: (item: ShippingAddress) => void
  onAdd: () => void
  title?: string
  extraScrollLocks?: RefObject<HTMLElement | null>[]
  disablePortal?: boolean
}) {
  const empty = addresses.length === 0

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      extraScrollLocks={extraScrollLocks}
      disablePortal={disablePortal}
      footer={
        <Button size="lg" block onClick={onAdd} variant="secondary">
          添加新地址
        </Button>
      }
    >
      {empty ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-50">
            <MapPinPlus size={24} strokeWidth={1.5} className="text-gold-700" />
          </div>
          <p className="text-body-strong text-foreground">还没有收货地址</p>
          <p className="text-caption text-subtle-foreground">
            点击下方按钮添加，才能继续提交订单
          </p>
        </div>
      ) : (
        <div className="space-y-3 pb-2">
          {addresses.map((item) => (
            <AddressCard
              key={item.id}
              name={item.name}
              phone={maskPhone(item.phone)}
              region={item.region}
              detail={`${item.place}${item.doorNo}`}
              tag={item.tag}
              mode="select"
              selected={selectedId === item.id}
              onClick={() => onSelect(item)}
            />
          ))}
        </div>
      )}
    </BottomSheet>
  )
}
