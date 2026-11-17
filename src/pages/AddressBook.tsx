import { AddressBookCard, Button, ConfirmDialog, EmptyState, ListPage } from '@/components'
import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  readAddresses,
  readSelectedAddressId,
  setDefaultAddress,
  writeAddresses,
} from '@/mocks/addressBook'
import { paths } from '@/routes/paths'

/**
 * 地址簿：勾选默认寄件地址，卡片内编辑 / 删除，底部固定添加入口。
 */
export function AddressBookPage() {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState(readAddresses)
  const [selectedId, setSelectedId] = useState(readSelectedAddressId)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleDefault = (id: string) => {
    setDefaultAddress(id)
    setSelectedId(id)
    setAddresses(readAddresses())
  }

  const handleDelete = () => {
    if (!deleteTarget) return

    const next = addresses.filter((address) => address.id !== deleteTarget)
    writeAddresses(next)

    if (selectedId === deleteTarget && next.length > 0) {
      setDefaultAddress(next[0].id)
      setSelectedId(next[0].id)
    }

    setAddresses(readAddresses())
    setDeleteTarget(null)
  }

  return (
    <ListPage
      title="我的地址"
      showBack
      isEmpty={addresses.length === 0}
      empty={
        <EmptyState
          icon={MapPin}
          title="您尚未添加寄件地址"
          description="添加地址后，下单时可快速选择寄件人信息。"
        />
      }
      footer={
        <Button size="lg" block onClick={() => navigate(paths.ship.addressForm)}>
          添加新地址
        </Button>
      }
    >
      {addresses.map((address) => (
        <AddressBookCard
          key={address.id}
          address={address}
          isDefault={address.id === selectedId}
          onToggleDefault={() => handleDefault(address.id)}
          onEdit={() => navigate(`${paths.ship.addressForm}?id=${address.id}`)}
          onDelete={() => setDeleteTarget(address.id)}
        />
      ))}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="删除该地址？"
        description="删除后无法恢复，下单时将无法再选择该地址。"
        confirmText="删除"
        tone="danger"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </ListPage>
  )
}
